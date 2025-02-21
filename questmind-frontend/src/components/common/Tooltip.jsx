import React, { useState } from 'react';
import classNames from 'classnames';

const Tooltip = ({
  children,
  content,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const tooltipClasses = classNames(
    'absolute z-10 px-2 py-1 text-sm text-white bg-dark-600 rounded shadow-lg',
    {
      'bottom-full mb-2': position === 'top',
      'top-full mt-2': position === 'bottom',
      'right-full mr-2': position === 'left',
      'left-full ml-2': position === 'right',
    },
    className
  );

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={tooltipClasses}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;