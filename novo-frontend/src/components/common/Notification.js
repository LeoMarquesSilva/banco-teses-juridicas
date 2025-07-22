// src/components/common/Notification.js
import React, { useState, useEffect } from 'react';
import './Notification.css';

function Notification({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return visible ? (
    <div className={`notification ${type}`}>
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={() => setVisible(false)}>
        &times;
      </button>
    </div>
  ) : null;
}

export default Notification;
