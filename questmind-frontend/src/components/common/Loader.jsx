import React from 'react';

const Loader = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary-500 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Loader;
