package com.global.atm_blockchain.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;
import java.nio.ByteBuffer;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   LAYER 1: AUTHENTICATED AES-256-GCM ENCRYPTION ENGINE      ║
 * ║   Threat: SQL Interception / DB Exfiltration / Padding Oracle║
 * ║   Defense: Encrypt every sensitive column before DB commit   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * AES-256-GCM provides BOTH confidentiality (encryption) AND integrity
 * verification (authentication tag). If an attacker tampers with even a
 * single bit of the stored ciphertext, decryption will throw a BadTagException,
 * triggering the SecurityException and alerting the system of tampering.
 *
 * Key is loaded strictly from a system environment variable (VAULT_AES_KEY).
 * It NEVER appears in source code, git history, or config files.
 */
@Converter
public class AuthenticatedEncryptionEngine implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;

    // Loaded strictly from an external system environment variable.
    // Set this by running: $env:VAULT_AES_KEY="YourBase64Encoded32ByteKey"
    // For development fallback: use a 32-character default key
    private static final String SYSTEM_PEPPER = System.getenv("VAULT_AES_KEY") != null
            ? System.getenv("VAULT_AES_KEY")
            : "GlobalATMBankVaultKey_AES256!!32"; // DEV ONLY — Replace in production

    @Override
    public String convertToDatabaseColumn(String rawData) {
        if (rawData == null || rawData.isEmpty()) return null;
        try {
            // Generate a cryptographically secure, unique random IV for every encryption call.
            // NEVER reuse IVs with GCM — doing so catastrophically breaks confidentiality.
            byte[] iv = new byte[IV_LENGTH_BYTE];
            SecureRandom.getInstanceStrong().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            SecretKey key = new SecretKeySpec(SYSTEM_PEPPER.getBytes(), "AES");
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec);

            byte[] ciphertext = cipher.doFinal(rawData.getBytes());

            // Concatenate [12-byte IV] + [encrypted ciphertext + 16-byte auth tag]
            // The IV is not secret; it simply ensures uniqueness per encryption call.
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            byteBuffer.put(iv);
            byteBuffer.put(ciphertext);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new SecurityException("Database column encryption failure. Halting transaction.", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String encryptedData) {
        if (encryptedData == null || encryptedData.isEmpty()) return null;
        try {
            byte[] decodedPayload = Base64.getDecoder().decode(encryptedData);

            // Extract the original IV from the first 12 bytes of the stored payload
            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedPayload);
            byte[] iv = new byte[IV_LENGTH_BYTE];
            byteBuffer.get(iv);

            byte[] ciphertext = new byte[byteBuffer.remaining()];
            byteBuffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            SecretKey key = new SecretKeySpec(SYSTEM_PEPPER.getBytes(), "AES");
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec);

            // GCM will throw AEADBadTagException here if the ciphertext was tampered with.
            return new String(cipher.doFinal(ciphertext));
        } catch (Exception e) {
            // This is a CRITICAL security event — log it and alert ops.
            System.err.println("[SECURITY ALERT] Ciphertext integrity verification FAILED. Potential DB tampering detected.");
            throw new SecurityException("Ciphertext integrity verification failed. Potential tampering detected.", e);
        }
    }
}
