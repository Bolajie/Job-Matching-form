import React from 'react';
import { EmployeeFormData } from '../types';
import { SKILL_LEVELS } from '../constants';
import { FormField } from './FormField';
import { FileUploader } from './FileUploader';
import { LoaderIcon, UserIcon, AtSymbolIcon, PhoneIcon } from './icons';

interface EmployeeFormProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  onSubmit: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ formData, setFormData, onSubmit, isLoading, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, resume: file }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <FormField
          id="fullName"
          label="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          icon={<UserIcon />}
          required
        />
        <FormField
          id="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<AtSymbolIcon />}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <FormField
          id="phone"
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          icon={<PhoneIcon />}
        />
        <FormField
          id="skillLevel"
          label="Your Skill Level"
          type="select"
          value={formData.skillLevel}
          onChange={handleChange}
          options={SKILL_LEVELS.map(l => ({ value: l, label: l }))}
        />
      </div>
      
      <FileUploader onFileChange={handleFileChange} error={errors.resume} />

      <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold h-12 px-4 rounded-xl shadow-md hover:bg-primary-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-200 text-16px">
        {isLoading ? <LoaderIcon className="animate-spin h-5 w-5" /> : null}
        <span>{isLoading ? 'Submitting...' : 'Submit Application'}</span>
      </button>
    </form>
  );
};