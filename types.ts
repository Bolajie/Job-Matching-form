
export enum FormType {
  Company = 'company',
  Employee = 'employee',
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type JobType = 'Remote' | 'Hybrid' | 'On-site';

export interface CompanyFormData {
  companyName: string;
  companyEmail: string;
  role: string;
  skills: string[];
  skillLevel: SkillLevel;
  educationLevel: string;
  country: string;
  jobType: JobType;
}

export interface EmployeeFormData {
  fullName: string;
  email: string;
  phone: string;
  skillLevel: SkillLevel;
  resume: File | null;
}
