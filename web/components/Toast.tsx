import { useEffect } from 'react';
import { Colors } from '../constants/colors';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return '#f59e0b';
      default:
        return Colors.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-down max-w-md"
      style={{
        backgroundColor: getBackgroundColor(),
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <span className="text-2xl font-bold" style={{ color: Colors.white }}>
        {getIcon()}
      </span>
      <p className="text-lg font-semibold flex-1" style={{ color: Colors.white }}>
        {message}
      </p>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <span className="text-lg font-bold" style={{ color: Colors.white }}>
          ✕
        </span>
      </button>
    </div>
  );
}
