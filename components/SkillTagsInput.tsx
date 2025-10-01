import React, { useState } from 'react';
import { MAX_SKILLS } from '../constants';
import { CloseIcon } from './icons';

interface SkillTagsInputProps {
  skills: string[];
  setSkills: (skills: string[]) => void;
}

export const SkillTagsInput: React.FC<SkillTagsInputProps> = ({ skills, setSkills }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (skills.length < MAX_SKILLS && !skills.includes(inputValue.trim())) {
        setSkills([...skills, inputValue.trim()]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue) {
        removeSkill(skills.length - 1);
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      <label htmlFor="skills" className="block text-14px font-semibold text-slate-600 dark:text-slate-300 mb-1">Skills Required</label>
      <div className="flex flex-wrap items-center gap-2 p-2 min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-surface-dark focus-within:ring-2 focus-within:ring-primary">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center gap-1.5 bg-primary/20 text-primary-700 dark:bg-primary/30 dark:text-indigo-200 text-14px font-medium px-3 h-8 rounded-2xl max-w-[180px]">
            <span className="truncate">{skill}</span>
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="text-primary-700 dark:text-indigo-200 hover:text-danger"
              aria-label={`Remove ${skill}`}
            >
              <CloseIcon size={16} />
            </button>
          </div>
        ))}
        <input
          id="skills"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length < MAX_SKILLS ? 'Add skill & press Enter' : 'Max skills reached'}
          className="flex-grow bg-transparent outline-none p-1 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-16px"
          disabled={skills.length >= MAX_SKILLS}
          aria-label="Add a new skill"
        />
      </div>
      <p className="text-12px text-slate-500 dark:text-slate-400 mt-1 text-right">
        {MAX_SKILLS - skills.length} skills remaining
      </p>
    </div>
  );
};