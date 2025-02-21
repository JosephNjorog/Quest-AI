import React from 'react';
import { useEffect } from 'react';
import classNames from 'classnames';

const Notification = ({
  type = 'info',
  message,
  onClose,
  duration = 5000,
  className = ''
}) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const notificationClasses = classNames(
    'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-md animate-slide-in',
    {
      'bg-blue-500': type === 'info',
      'bg-green-500': type === 'success',
      'bg-red-500': type === 'error',
      'bg-yellow-500': type === 'warning',
    },
    className
  );

  return (
    <div className={notificationClasses}>
      <div className="flex items-center justify-between">
        <p className="text-white">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;