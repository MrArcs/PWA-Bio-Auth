
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { AuthState, UserProfile } from './types';
import { storageService } from './services/storage';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check for existing session (in a real app, this might be a token)
    // For this POC, we stay logged out until biometric login happens
    setIsInitializing(false);
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setAuthState({
      isAuthenticated: true,
      user,
    });
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white text-black font-sans uppercase tracking-[0.2em] animate-pulse">
        Initializing Secure Environment
      </div>
    );
  }

  return (
    <Layout 
      title={authState.isAuthenticated ? "Dashboard" : "Auth Gate"}
      onLogout={authState.isAuthenticated ? handleLogout : undefined}
    >
      {authState.isAuthenticated && authState.user ? (
        <Dashboard user={authState.user} />
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
    </Layout>
  );
};

export default App;
