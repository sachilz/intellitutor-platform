import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = Info;
        let typeClass = 'toast-info';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          typeClass = 'toast-success';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          typeClass = 'toast-error';
        }

        return (
          <div key={toast.id} className={`toast ${typeClass}`}>
            <Icon size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div className="toast-content">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              <div>{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
