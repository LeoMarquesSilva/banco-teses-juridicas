// src/components/CustomToast.jsx
import React from 'react';
import { toast } from 'react-toastify';
import './CustomToast.css'; // Crie este arquivo para estilizar

export const showSuccessToast = (message) => {
  return toast.success(
    <div className="custom-toast success">
      <i className="fas fa-check-circle"></i>
      <span>{message}</span>
    </div>
  );
};

export const showErrorToast = (message) => {
  return toast.error(
    <div className="custom-toast error">
      <i className="fas fa-exclamation-circle"></i>
      <span>{message}</span>
    </div>
  );
};
