package com.global.atm_blockchain.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.UserRepository;
import com.yubico.webauthn.*;
import com.yubico.webauthn.data.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

@Service
public class WebAuthnService {

    @Autowired
    private UserRepository userRepository;

    private final RelyingParty relyingParty;
    private final ObjectMapper mapper = new ObjectMapper();

    public WebAuthnService(UserRepository userRepository) {
        this.userRepository = userRepository;
        
        RelyingPartyIdentity rpIdentity = RelyingPartyIdentity.builder()
                .id("localhost")
                .name("Global ATM")
                .build();

        CredentialRepository credentialRepository = new CredentialRepository() {
            @Override
            public Set<PublicKeyCredentialDescriptor> getCredentialIdsForUsername(String username) {
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent() && userOpt.get().getWebauthnCredentialId() != null) {
                    try {
                        ByteArray credId = new ByteArray(userOpt.get().getWebauthnCredentialId());
                        return Collections.singleton(
                                PublicKeyCredentialDescriptor.builder()
                                        .id(credId)
                                        .build()
                        );
                    } catch (Exception e) {
                        return Collections.emptySet();
                    }
                }
                return Collections.emptySet();
            }

            @Override
            public Optional<ByteArray> getUserHandleForUsername(String username) {
                Optional<User> userOpt = userRepository.findByUsername(username);
                return userOpt.map(user -> new ByteArray(user.getUsername().getBytes()));
            }

            @Override
            public Optional<String> getUsernameForUserHandle(ByteArray userHandle) {
                return Optional.of(new String(userHandle.getBytes()));
            }

            @Override
            public Optional<RegisteredCredential> lookup(ByteArray credentialId, ByteArray userHandle) {
                Optional<User> userOpt = userRepository.findByUsername(new String(userHandle.getBytes()));
                if (userOpt.isPresent() && userOpt.get().getWebauthnPublicKey() != null) {
                    return Optional.of(
                            RegisteredCredential.builder()
                                    .credentialId(credentialId)
                                    .userHandle(userHandle)
                                    .publicKeyCose(new ByteArray(userOpt.get().getWebauthnPublicKey()))
                                    .signatureCount(userOpt.get().getWebauthnSignCount())
                                    .build()
                    );
                }
                return Optional.empty();
            }

            @Override
            public Set<RegisteredCredential> lookupAll(ByteArray credentialId) {
                return Collections.emptySet(); // Simplified
            }
        };

        this.relyingParty = RelyingParty.builder()
                .identity(rpIdentity)
                .credentialRepository(credentialRepository)
                .build();
    }

    public String startRegistration(String username) throws JsonProcessingException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PublicKeyCredentialCreationOptions request = relyingParty.startRegistration(
                StartRegistrationOptions.builder()
                        .user(UserIdentity.builder()
                                .name(username)
                                .displayName(username)
                                .id(new ByteArray(username.getBytes()))
                                .build())
                        .build()
        );

        return mapper.writeValueAsString(request);
    }

    public void finishRegistration(String username, String responseJson) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PublicKeyCredential<AuthenticatorAttestationResponse, ClientRegistrationExtensionOutputs> pkc =
                PublicKeyCredential.parseRegistrationResponseJson(responseJson);

        RegistrationResult result = relyingParty.finishRegistration(
                FinishRegistrationOptions.builder()
                        .request(PublicKeyCredentialCreationOptions.builder()
                                .rp(RelyingPartyIdentity.builder().id("localhost").name("Global ATM").build())
                                .user(UserIdentity.builder().name(username).displayName(username).id(new ByteArray(username.getBytes())).build())
                                .challenge(pkc.getResponse().getClientData().getChallenge())
                                .pubKeyCredParams(Collections.emptyList())
                                .build())
                        .response(pkc)
                        .build()
        );

        user.setWebauthnCredentialId(result.getKeyId().getId().getBytes());
        user.setWebauthnPublicKey(result.getPublicKeyCose().getBytes());
        user.setWebauthnSignCount(0L);
        userRepository.save(user);
    }

    public String startAuthentication(String username) throws JsonProcessingException {
        AssertionRequest request = relyingParty.startAssertion(
                StartAssertionOptions.builder()
                        .username(username)
                        .build()
        );
        return mapper.writeValueAsString(request.getPublicKeyCredentialRequestOptions());
    }

    public boolean finishAuthentication(String username, String responseJson) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            PublicKeyCredential<AuthenticatorAssertionResponse, ClientAssertionExtensionOutputs> pkc =
                    PublicKeyCredential.parseAssertionResponseJson(responseJson);

            AssertionRequest assertionRequest = relyingParty.startAssertion(
                    StartAssertionOptions.builder().username(username).build()
            );

            AssertionResult result = relyingParty.finishAssertion(
                    FinishAssertionOptions.builder()
                            .request(assertionRequest)
                            .response(pkc)
                            .build()
            );

            if (result.isSuccess()) {
                user.setWebauthnSignCount(result.getSignatureCount());
                userRepository.save(user);
                return true;
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
