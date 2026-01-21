
/**
 * Simple WebAuthn implementation for biometric login.
 * Note: Real implementation would verify signatures on a backend.
 * For this POC, we are simulating the verification locally.
 */

// --- Helpers for base64url encoding/decoding of credential IDs ---
const bufferToBase64Url = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const base64UrlToBuffer = (base64url: string): ArrayBuffer => {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/')
    + '='.repeat((4 - (base64url.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
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
      // Store the rawId as base64url so it can be round-tripped for allowCredentials
      credentialId: bufferToBase64Url(credential.rawId),
      publicKey: "SIMULATED_PUBLIC_KEY", // In a real app, this would be exported from the credential
    };
  },

  login: async (storedCredentialId: string): Promise<boolean> => {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    
    // WebAuthn .get() expects allowCredentials.id as ArrayBuffer (rawId)
    let rawId: ArrayBuffer;
    try {
      rawId = base64UrlToBuffer(storedCredentialId);
    } catch {
      // Fallback for any legacy stored plain strings (may still fail on some platforms)
      rawId = new TextEncoder().encode(storedCredentialId).buffer;
    }

    const allowCredentials: PublicKeyCredentialDescriptor[] = [
      {
        id: rawId,
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
