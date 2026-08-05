import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Expenses', path: '/expenses' },
    { name: 'Tax Summary', path: '/taxes' },
    { name: 'Salary Setup', path: '/salary-setup' },
  ];

  return (
    <div className="min-h-screen bg-canvas-light text-ink dark:bg-canvas-dark dark:text-on-dark transition-colors duration-200">
      <nav className="sticky top-0 z-40 bg-canvas-light/80 dark:bg-canvas-dark/80 backdrop-blur-md border-b border-hairline-light dark:border-hairline-dark">
        <div className="max-w-5xl mx-auto px-xl h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-xl">
            <h1 className="font-display font-semibold text-lg tracking-tight">Salary Tracker</h1>
            <div className="hidden md:flex items-center gap-md">
              {links.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-primary-base dark:text-primary-light' 
                      : 'text-mute hover:text-ink dark:text-on-dark-mute dark:hover:text-on-dark'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto px-xl py-sm border-t border-hairline-light dark:border-hairline-dark gap-md">
          {links.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                location.pathname === link.path 
                  ? 'text-primary-base dark:text-primary-light' 
                  : 'text-mute hover:text-ink dark:text-on-dark-mute dark:hover:text-on-dark'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
};
