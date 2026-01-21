
/**
 * Simple WebAuthn implementation for biometric login.
 * Note: Real implementation would verify signatures on a backend.
 * For this POC, we are simulating the verification locally.
 */

// Helper to convert string to ArrayBuffer
const coerceToArrayBuffer = (str: string): ArrayBuffer => {
  return new TextEncoder().encode(str).buffer;
};

// Helper to convert ArrayBuffer to Base64 (for storage)
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const webAuthnService = {
  isSupported: (): boolean => {
    return !!(window.PublicKeyCredential && 
           window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable);
  },

  register: async (username: string): Promise<{ credentialId: string; publicKey: string }> => {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const creationOptions: PublicKeyCredentialCreationOptions = {
      challenge: challenge,
      rp: {
        name: "Minimal Biometric PWA",
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      },
      user: {
        id: userId,
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Enforces FaceID/Fingerprint
        userVerification: "required",
      },
      timeout: 60000,
    };

    const credential = (await navigator.credentials.create({
      publicKey: creationOptions,
    })) as PublicKeyCredential;

    if (!credential) throw new Error("Registration failed");

    return {
      credentialId: credential.id,
      publicKey: "SIMULATED_PUBLIC_KEY", // In a real app, this would be exported from the credential
    };
  },

  login: async (storedCredentialId: string): Promise<boolean> => {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    
    // Decode credentialId from base64 if needed, though raw ID usually works fine for get()
    // Convert string ID to buffer if needed, but WebAuthn .get() expects allowCredentials.id as ArrayBuffer
    const allowCredentials: PublicKeyCredentialDescriptor[] = [
      {
        id: coerceToArrayBuffer(storedCredentialId),
        type: "public-key",
        transports: ["internal"],
      },
    ];

    const requestOptions: PublicKeyCredentialRequestOptions = {
      challenge: challenge,
      allowCredentials,
      userVerification: "required",
      timeout: 60000,
    };

    const assertion = await navigator.credentials.get({
      publicKey: requestOptions,
    });

    return !!assertion;
  }
};
