import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  as?: 'input' | 'select';
  options?: { value: string; label: string }[];
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  as = 'input',
  options = [],
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700 ml-1">
          {label}
        </label>
      )}
      
      {as === 'select' ? (
        <div className="relative">
          <select
            className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all appearance-none ${className}`}
            {...props as React.SelectHTMLAttributes<HTMLSelectElement>}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      ) : (
        <input
          className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all ${className}`}
          {...props as React.InputHTMLAttributes<HTMLInputElement>}
        />
      )}
      
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
};