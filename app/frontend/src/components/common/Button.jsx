import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'rounded px-4 py-2 text-sm font-medium transition-colors cursor-pointer';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
