import React from 'react';
import { CheckCircleIcon } from './icons';

interface ThankYouPageProps {
  onReset: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ onReset }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background-light dark:bg-background-dark">
      <main className="w-full max-w-md mx-auto text-center">
        <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-lg">
          <div className="inline-flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Thank you!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Your submission has been received. We'll be in touch shortly.
          </p>
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold h-12 px-4 rounded-xl shadow-md hover:bg-primary-700 transition-all duration-200 text-16px"
          >
            Submit another response
          </button>
        </div>
      </main>
    </div>
  );
};
