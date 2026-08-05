import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@salary-tracker/shared';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-surface-soft dark:bg-surface-elevated text-mute dark:text-on-dark-mute hover:text-ink dark:hover:text-on-dark transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
