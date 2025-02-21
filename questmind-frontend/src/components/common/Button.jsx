import React from 'react';
import classNames from 'classnames';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '', 
  ...props 
}) => {
  const buttonClasses = classNames(
    {
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-outline': variant === 'outline',
      'btn-danger': variant === 'danger',
      'opacity-50 cursor-not-allowed': disabled,
      'py-1 px-2 text-sm': size === 'sm',
      'py-2 px-4': size === 'md',
      'py-3 px-6 text-lg': size === 'lg',
    },
    className
  );

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      ) : children}
    </button>
  );
};

export default Button;