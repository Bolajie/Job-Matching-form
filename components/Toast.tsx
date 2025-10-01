
import React, { useEffect } from 'react';
import { CloseIcon, InfoIcon, ErrorIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-danger' : 'bg-green-500';
  const Icon = type === 'error' ? ErrorIcon : InfoIcon;

  return (
    <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor} animate-fade-in-up`}>
      <Icon className="h-6 w-6 mr-3" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/20">
        <CloseIcon size={16} />
      </button>
    </div>
  );
};

// Add keyframes for animation in a style tag or your main CSS if you had one.
// Since we don't, this is a simple way to do it. A real app might use a CSS file.
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fade-in-up {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
}
