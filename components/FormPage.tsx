import React, { useState, useCallback } from 'react';
import { CompanyForm } from './CompanyForm';
import { EmployeeForm } from './EmployeeForm';
import { PillToggle } from './PillToggle';
import { FormType, CompanyFormData, EmployeeFormData } from '../types';
import { submitForm } from '../services/webhookService';
import { LogoIcon, LogoutIcon } from './icons';

interface FormPageProps {
  showToast: (message: string, type: 'success' | 'error') => void;
  onFormSuccess: () => void;
  onLogout: () => void;
}

const formTypes = [
    { label: 'Company', value: FormType.Company },
    { label: 'Employee / Intern', value: FormType.Employee }
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;


export const FormPage: React.FC<FormPageProps> = ({ showToast, onFormSuccess, onLogout }) => {
  const [activeForm, setActiveForm] = useState<FormType>(FormType.Company);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [companyFormData, setCompanyFormData] = useState<CompanyFormData>({
    companyName: '',
    companyEmail: '',
    role: '',
    skills: ['React', 'TypeScript'],
    skillLevel: 'Intermediate',
    educationLevel: '',
    country: 'United States',
    jobType: 'Remote',
  });

  const [employeeFormData, setEmployeeFormData] = useState<EmployeeFormData>({
    fullName: '',
    email: '',
    phone: '',
    skillLevel: 'Intermediate',
    resume: null,
  });
  
  const validateForm = (type: FormType, data: CompanyFormData | EmployeeFormData): boolean => {
    const newErrors: Record<string, string> = {};
    if (type === FormType.Company) {
      const d = data as CompanyFormData;
      if (!d.companyName) newErrors.companyName = 'Company name is required.';
      if (!d.companyEmail) newErrors.companyEmail = 'Company email is required.';
      else if (!emailRegex.test(d.companyEmail)) newErrors.companyEmail = 'Invalid email format.';
      if (!d.role) newErrors.role = 'Role is required.';
    } else {
      const d = data as EmployeeFormData;
      if (!d.fullName) newErrors.fullName = 'Full name is required.';
      if (!d.email) newErrors.email = 'Email is required.';
      else if (!emailRegex.test(d.email)) newErrors.email = 'Invalid email format.';
      if (d.phone && !phoneRegex.test(d.phone)) newErrors.phone = 'Invalid phone number format.';
      if (!d.resume) newErrors.resume = 'Resume is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = useCallback(async () => {
    const data = activeForm === FormType.Company ? companyFormData : employeeFormData;
    if (!validateForm(activeForm, data)) {
        return;
    }

    setIsLoading(true);
    setErrors({});
    
    const result = await submitForm(activeForm, data);

    if (result.success) {
      onFormSuccess();
    } else {
      showToast(result.message, 'error');
    }

    setIsLoading(false);

  }, [activeForm, companyFormData, employeeFormData, showToast, onFormSuccess]);

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <main className="max-w-3xl mx-auto">
        <header className="relative text-center mb-8">
            <button
                onClick={onLogout}
                className="absolute top-0 right-0 z-10 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light font-semibold py-2 px-3 rounded-lg transition-colors"
                aria-label="Logout"
            >
                <LogoutIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
            </button>
          <div className="inline-flex items-center gap-2 mb-2">
             <LogoIcon />
             <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Dareautomate Job Portal
             </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Fill out the details below to submit your application or job posting.
          </p>
        </header>

        <PillToggle
            options={formTypes}
            activeOption={activeForm}
            onOptionClick={(value) => setActiveForm(value as FormType)}
        />

        <div className="bg-white dark:bg-surface-dark p-6 sm:p-8 rounded-2xl shadow-lg mt-8">
            {activeForm === FormType.Company ? (
                <CompanyForm
                formData={companyFormData}
                setFormData={setCompanyFormData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                errors={errors}
                />
            ) : (
                <EmployeeForm
                formData={employeeFormData}
                setFormData={setEmployeeFormData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                errors={errors}
                />
            )}
        </div>
      </main>
    </div>
  );
};