
import React, { useState, useEffect } from 'react';
import { webAuthnService } from '../services/webAuthn';
import { storageService } from '../services/storage';
import { UserProfile } from '../types';

interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setExistingUser(storageService.getUser());
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    setLoading(true);
    setError(null);
    try {
      const { credentialId, publicKey } = await webAuthnService.register(username);
      const newUser: UserProfile = {
        username,
        credentialId,
        publicKey,
        createdAt: Date.now(),
      };
      storageService.saveUser(newUser);
      onAuthSuccess(newUser);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Biometrics may not be available.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!existingUser) return;
    
    setLoading(true);
    setError(null);
    try {
      const success = await webAuthnService.login(existingUser.credentialId);
      if (success) {
        onAuthSuccess(existingUser);
      } else {
        setError('Verification failed');
      }
    } catch (err: any) {
      setError('Biometric authentication failed or was cancelled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 border-2 border-black rounded-full mx-auto flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-8.193-4.253m8.193 4.253c1.258 0 2.453-.236 3.547-.665m-3.547.665c3.517 0 6.799-1.009 9.571-2.753m-2.04-3.44l-.09.054A10.003 10.003 0 0021 12m0 0c0-3.517-1.009-6.799-2.753-9.571m-3.44 2.04l.054-.09A10.003 10.003 0 0012 3m0 0c-1.258 0-2.453.236-3.547.665" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold uppercase tracking-tight">Identity</h2>
        <p className="text-sm opacity-60">Secure Biometric Access</p>
      </div>

      <div className="w-full max-w-sm border border-black p-8 space-y-6">
        {error && (
          <div className="text-xs text-red-600 border border-red-600 p-2 text-center uppercase">
            {error}
          </div>
        )}

        {existingUser && !isRegistering ? (
          <div className="space-y-4">
            <p className="text-center text-sm">
              Welcome back, <span className="font-bold">{existingUser.username}</span>
            </p>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-black text-white py-4 uppercase text-sm font-bold tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-all"
            >
              {loading ? 'Verifying...' : 'Login with Biometrics'}
            </button>
            <button
              onClick={() => setIsRegistering(true)}
              className="w-full text-xs text-center underline uppercase opacity-50 hover:opacity-100"
            >
              Use a different account
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold opacity-40">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter identifier"
                className="w-full border-b border-black py-2 focus:outline-none focus:border-b-2 text-sm placeholder:opacity-20 bg-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 uppercase text-sm font-bold tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-all"
            >
              {loading ? 'Processing...' : 'Register & Secure'}
            </button>
            {existingUser && (
               <button
               type="button"
               onClick={() => setIsRegistering(false)}
               className="w-full text-xs text-center underline uppercase opacity-50 hover:opacity-100"
             >
               Back to Login
             </button>
            )}
          </form>
        )}
      </div>

      <div className="text-[10px] uppercase text-center opacity-30 max-w-xs leading-relaxed">
        * Biometric authentication requires a secure context and hardware support (FaceID, TouchID, or Android Biometrics).
      </div>
    </div>
  );
};

export default Auth;
