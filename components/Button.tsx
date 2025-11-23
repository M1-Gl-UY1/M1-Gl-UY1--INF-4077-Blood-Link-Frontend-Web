import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#EF5350] hover:bg-[#E53935] text-white shadow-md shadow-red-200",
    secondary: "bg-[#4798B8] hover:bg-[#3684a3] text-white shadow-md shadow-blue-200", // Based on screenshot "S'inscrire" button
    outline: "border-2 border-gray-200 text-gray-600 hover:border-[#EF5350] hover:text-[#EF5350] bg-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};