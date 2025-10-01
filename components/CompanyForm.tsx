import React from 'react';
import { CompanyFormData } from '../types';
import { SKILL_LEVELS, JOB_TYPES, countries } from '../constants';
import { SkillTagsInput } from './SkillTagsInput';
import { SearchableSelect } from './SearchableSelect';
import { FormField } from './FormField';
import { LoaderIcon, OfficeBuildingIcon, AtSymbolIcon, BriefcaseIcon, GlobeIcon } from './icons';

interface CompanyFormProps {
  formData: CompanyFormData;
  setFormData: React.Dispatch<React.SetStateAction<CompanyFormData>>;
  onSubmit: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({ formData, setFormData, onSubmit, isLoading, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
      <FormField
        id="companyName"
        label="Company Name"
        value={formData.companyName}
        onChange={handleChange}
        error={errors.companyName}
        icon={<OfficeBuildingIcon />}
        required
      />
      <FormField
        id="companyEmail"
        label="Company Email"
        type="email"
        value={formData.companyEmail}
        onChange={handleChange}
        error={errors.companyEmail}
        icon={<AtSymbolIcon />}
        required
      />
      
      <div className="md:col-span-2">
        <FormField
          id="role"
          label="Role / Position"
          value={formData.role}
          onChange={handleChange}
          error={errors.role}
          icon={<BriefcaseIcon />}
          required
        />
      </div>
      
      <div className="md:col-span-2">
        <SkillTagsInput 
          skills={formData.skills} 
          setSkills={(skills) => setFormData(p => ({...p, skills}))} 
        />
      </div>

      <FormField
        id="skillLevel"
        label="Required Skill Level"
        type="select"
        value={formData.skillLevel}
        onChange={handleChange}
        options={SKILL_LEVELS.map(l => ({ value: l, label: l }))}
      />
      <FormField
        id="educationLevel"
        label="Education Level"
        value={formData.educationLevel}
        onChange={handleChange}
        placeholder="e.g. Bachelor's Degree"
      />
      
      <div className="md:col-span-2">
        <label htmlFor="country" className="block text-14px font-semibold text-slate-600 dark:text-slate-300 mb-1">Country</label>
        <SearchableSelect 
          id="country" 
          options={countries} 
          value={formData.country} 
          onChange={(val) => setFormData(p => ({...p, country: val}))}
          icon={<GlobeIcon />}
        />
      </div>

      <fieldset className="md:col-span-2">
        <legend className="block text-14px font-semibold text-slate-600 dark:text-slate-300 mb-2">Job Type</legend>
        <div className="flex items-center space-x-2">
            {JOB_TYPES.map(type => (
                 <button
                    type="button"
                    key={type}
                    onClick={() => setFormData(p => ({...p, jobType: type}))}
                    className={`w-full h-11 px-3 text-16px font-medium rounded-xl transition-colors flex items-center justify-center min-w-[120px] ${formData.jobType === type ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                    aria-pressed={formData.jobType === type}
                >
                    {type}
                </button>
            ))}
        </div>
      </fieldset>
      
      <div className="md:col-span-2">
        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold h-12 px-4 rounded-xl shadow-md hover:bg-primary-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-200 text-16px">
          {isLoading ? <LoaderIcon className="animate-spin h-5 w-5" /> : null}
          <span>{isLoading ? 'Submitting...' : 'Submit Application'}</span>
        </button>
      </div>
    </form>
  );
};