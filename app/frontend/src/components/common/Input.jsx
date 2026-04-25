import React from 'react';

export const Input = ({ 
  label, 
  type = 'text', 
  error, 
  helpText,
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-3 py-2 text-sm bg-white border rounded-lg shadow-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1
          placeholder:text-gray-400
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 text-red-900 focus:ring-red-500' 
            : 'border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
