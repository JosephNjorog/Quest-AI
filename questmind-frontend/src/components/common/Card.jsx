import React from 'react';
import classNames from 'classnames';

const Card = ({ 
  children, 
  variant = 'default',
  className = '', 
  ...props 
}) => {
  const cardClasses = classNames(
    'card',
    {
      'hover:shadow-glow': variant === 'interactive',
      'border-primary-500': variant === 'highlight',
    },
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;