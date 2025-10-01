import React, { useState } from 'react';
import { FormField } from './FormField';
import { LogoIcon, AtSymbolIcon, LockClosedIcon, LoaderIcon } from './icons';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

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
      if (email === 'test@test.com' && password === 'password') {
        onLoginSuccess();
      } else {
        setError('Invalid email or password. Use test@test.com and "password".');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background-light dark:bg-background-dark">
      <main className="w-full max-w-[420px] mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LogoIcon className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sign in to your account
          </h1>
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