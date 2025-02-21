import React from 'react';
import classNames from 'classnames';

const Input = React.forwardRef(({ 
  label,
  error,
  variant = 'default',
  className = '',
  ...props 
}, ref) => {
  const inputClasses = classNames(
    'input-field',
    {
      'command-field': variant === 'command',
      'border-red-500 focus:ring-red-500': error,
    },
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

export default Input;