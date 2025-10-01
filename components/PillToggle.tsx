import React from 'react';
import { BriefcaseIcon, UserIcon } from './icons';

interface PillToggleOption {
    label: string;
    value: string;
}

interface PillToggleProps {
  options: PillToggleOption[];
  activeOption: string;
  onOptionClick: (value: string) => void;
}

export const PillToggle: React.FC<PillToggleProps> = ({ options, activeOption, onOptionClick }) => {
    const getIcon = (value: string) => {
        if (value === 'company') return <BriefcaseIcon />;
        if (value === 'employee') return <UserIcon />;
        return null;
    }
    
  return (
    <div className="bg-white dark:bg-slate-800/50 p-1.5 rounded-xl shadow-md">
      <div className="flex justify-center items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {options.map(option => (
            <button
                key={option.value}
                onClick={() => onOptionClick(option.value)}
                className={`w-full py-2.5 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
                    activeOption === option.value
                    ? 'bg-primary text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                aria-pressed={activeOption === option.value}
            >
                {getIcon(option.value)}
                {option.label}
            </button>
        ))}
      </div>
    </div>
  );
};