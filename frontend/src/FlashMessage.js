import React, { useEffect } from 'react';


const FlashMessage = ({ type, message, setFlashMessage }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setFlashMessage({ type: '', message: '' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [setFlashMessage]);

  return (
    <div
      className={`alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
      role="alert"
    >
      {message}
      <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  );
};

export default FlashMessage;