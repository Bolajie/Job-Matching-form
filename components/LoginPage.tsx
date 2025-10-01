import React, { useState } from 'react';
import { FormField } from './FormField';
import { LogoIcon, AtSymbolIcon, LockClosedIcon, LoaderIcon } from './icons';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

// NOTE: This is a mock authentication for demonstration purposes.
const users = [
  { email: 'bolajiemmanuel93@gmail.com', password: 'Emmanuel@15842' },
  { email: '******', password: '@@@@@@@' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // NOTE: This is a mock authentication for demonstration purposes.
    // In a real production app, you would use a secure authentication service.
    setTimeout(() => {
      const foundUser = users.find(user => user.email === email && user.password === password);
      if (foundUser) {
        onLoginSuccess();
      } else {
        setError('Invalid email or password.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background-light dark:bg-background-dark">
      <main className="w-full max-w-[420px] mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <LogoIcon className="h-12 w-12 text-primary" />
            <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Dareautomate
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
            Sign in to the Job Portal
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            We pair the best employees with the best companies.
          </p>
        </div>
        
        <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField 
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<AtSymbolIcon />}
              required
            />
             <FormField 
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<LockClosedIcon />}
              required
            />
            
            {error && <p className="text-12px text-danger text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold h-12 px-4 rounded-xl shadow-md hover:bg-primary-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-200 text-16px"
            >
              {isLoading ? <LoaderIcon className="animate-spin h-5 w-5" /> : null}
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};