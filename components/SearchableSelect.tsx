import React, { useState, useRef, useEffect } from 'react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  icon?: React.ReactNode;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, id, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectOption = (option: string) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  const paddingClass = icon ? 'pl-11 pr-4' : 'px-4';

  return (
    <div className="relative" ref={wrapperRef}>
       {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {React.cloneElement(icon as React.ReactElement<{ className: string }>, { className: "h-5 w-5" })}
          </div>
        )}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center text-left h-11 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-16px ${paddingClass}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{value || 'Select a country'}</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 px-4 text-16px bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search for a country"
            />
          </div>
          <ul role="listbox">
            {filteredOptions.length > 0 ? filteredOptions.map(option => (
              <li
                key={option}
                onClick={() => selectOption(option)}
                className="px-4 py-2 text-16px text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white cursor-pointer"
                role="option"
                aria-selected={value === option}
              >
                {option}
              </li>
            )) : (
              <li className="px-4 py-2 text-16px text-slate-500 italic">No countries found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};