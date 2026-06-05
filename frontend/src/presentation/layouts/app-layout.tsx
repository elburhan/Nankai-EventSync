import { Outlet } from 'react-router-dom';

import { Navbar } from '../components/navbar';

export const AppLayout = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="app-with-logo-bg flex min-h-screen flex-col bg-hero-grid">
      <Navbar />

      <main className="mx-auto flex-1 max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-xs text-ink/60 sm:px-6 lg:px-8">
          <span>&copy; {currentYear} Gbobe Systems. All rights reserved.</span>
          <span className="hidden sm:inline">Developed by Gbobe Systems.</span>
        </div>
      </footer>
    </div>
  );
};
