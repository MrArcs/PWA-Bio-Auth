
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      <header className="border-b border-black p-4 flex justify-between items-center sticky top-0 bg-white z-50">
        <h1 className="text-xl font-bold tracking-tighter uppercase">{title}</h1>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors uppercase font-medium"
          >
            Logout
          </button>
        )}
      </header>
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
      <footer className="border-t border-black p-4 text-[10px] text-center uppercase tracking-widest opacity-50">
        POC Biometric PWA &copy; 2024
      </footer>
    </div>
  );
};

export default Layout;
