import { useState, useEffect } from 'react';
import api from '../api/axiosClient';

/**
 * A hook to interact with the WebAuthn API (Passkeys, Fingerprint, TouchID, YubiKey).
 * Simplified simulation for standard WebAuthn flows.
 */
export const useWebAuthn = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if the browser supports WebAuthn
    if (window.PublicKeyCredential) {
      setIsSupported(true);
    }
  }, []);

  /**
   * Helper to convert Base64URL string to ArrayBuffer
   */
  const base64UrlToArrayBuffer = (base64url) => {
    const padding = '='.repeat((4 - base64url.length % 4) % 4);
    const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  };

  /**
   * Helper to convert ArrayBuffer to Base64URL string
   */
  const arrayBufferToBase64Url = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  /**
   * Register a new Passkey
   */
  const registerPasskey = async (username) => {
    setLoading(true);
    setError('');
    try {
      // 1. Get Registration Options from Server
      const startRes = await api.post('/api/auth/webauthn/register/start', { username });
      const options = startRes.data;

      // 2. Adjust options from JSON strings to ArrayBuffers for the browser API
      options.publicKey.challenge = base64UrlToArrayBuffer(options.publicKey.challenge);
      options.publicKey.user.id = base64UrlToArrayBuffer(options.publicKey.user.id);
      
      if (options.publicKey.excludeCredentials) {
        for (let cred of options.publicKey.excludeCredentials) {
          cred.id = base64UrlToArrayBuffer(cred.id);
        }
      }

      // 3. Ask browser to create credential (prompts TouchID / FaceID)
      const credential = await navigator.credentials.create({
        publicKey: options.publicKey
      });

      // 4. Transform credential to JSON to send to Server
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: arrayBufferToBase64Url(credential.response.attestationObject),
          clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
        },
      };

      // 5. Send back to Server to finish registration
      await api.post('/api/auth/webauthn/register/finish', {
        username,
        responseJson: JSON.stringify(credentialData)
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Passkey registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authenticate with a Passkey
   */
  const authenticateWithPasskey = async (username) => {
    setLoading(true);
    setError('');
    try {
      // 1. Get Authentication Options from Server
      const startRes = await api.post('/api/auth/webauthn/authenticate/start', { username });
      const options = startRes.data;

      // 2. Adjust options from JSON
      options.publicKey.challenge = base64UrlToArrayBuffer(options.publicKey.challenge);
      if (options.publicKey.allowCredentials) {
        for (let cred of options.publicKey.allowCredentials) {
          cred.id = base64UrlToArrayBuffer(cred.id);
        }
      }

      // 3. Ask browser to get credential (prompts TouchID / FaceID)
      const assertion = await navigator.credentials.get({
        publicKey: options.publicKey
      });

      // 4. Transform to JSON
      const assertionData = {
        id: assertion.id,
        rawId: arrayBufferToBase64Url(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: arrayBufferToBase64Url(assertion.response.authenticatorData),
          clientDataJSON: arrayBufferToBase64Url(assertion.response.clientDataJSON),
          signature: arrayBufferToBase64Url(assertion.response.signature),
          userHandle: assertion.response.userHandle ? arrayBufferToBase64Url(assertion.response.userHandle) : null,
        },
      };

      // 5. Send to Server for validation
      const finishRes = await api.post('/api/auth/webauthn/authenticate/finish', {
        username,
        responseJson: JSON.stringify(assertionData)
      });

      // Returns the standard JWT payload if successful
      return finishRes.data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Passkey authentication failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    loading,
    error,
    registerPasskey,
    authenticateWithPasskey
  };
};
