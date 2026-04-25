import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  loading = false,
  disabled = false,
  icon: Icon,
  ...props 
}) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm focus-visible:ring-indigo-600',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm focus-visible:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-500',
    outline: 'bg-transparent text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-600',
  };

  return (
    <button 
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
};
