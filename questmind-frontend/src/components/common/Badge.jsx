import React from 'react';
import classNames from 'classnames';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const badgeClasses = classNames(
    'inline-flex items-center rounded-full font-medium',
    {
      'px-2 py-0.5 text-xs': size === 'sm',
      'px-2.5 py-0.5 text-sm': size === 'md',
      'px-3 py-1 text-base': size === 'lg',
      'bg-primary-100 text-primary-800': variant === 'primary',
      'bg-secondary-100 text-secondary-800': variant === 'secondary',
      'bg-red-100 text-red-800': variant === 'danger',
      'bg-green-100 text-green-800': variant === 'success',
      'bg-yellow-100 text-yellow-800': variant === 'warning',
      'bg-gray-100 text-gray-800': variant === 'default',
    },
    className
  );

  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
};

export default Badge;
