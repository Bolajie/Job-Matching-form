import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from './icons';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const themes = [
    { name: 'Light', value: 'light', icon: <SunIcon className="h-5 w-5" /> },
    { name: 'Dark', value: 'dark', icon: <MoonIcon className="h-5 w-5" /> },
    { name: 'System', value: 'system', icon: <ComputerDesktopIcon className="h-5 w-5" /> },
  ];

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-700/50 rounded-full shadow-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:ring-offset-background-dark"
        aria-label="Toggle theme"
      >
        {currentTheme?.icon}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-12 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-1 border border-slate-200 dark:border-slate-700 animate-fade-in-up" style={{animationDuration: '150ms'}}>
          {themes.map(t => (
            <button
              key={t.value}
              onClick={() => {
                setTheme(t.value as 'light' | 'dark' | 'system');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left ${
                theme === t.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t.icon}
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};