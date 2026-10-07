import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={type === 'success' ? 'toast-success' : 'toast-error'}>
      {type === 'success' ? '✓ ' : '✗ '}{message}
    </div>
  );
}
