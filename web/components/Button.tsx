import { Colors } from '../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'text';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  icon,
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return Colors.backgroundTertiary;
    if (variant === 'text') return 'transparent';
    switch (variant) {
      case 'success':
        return Colors.success;
      case 'danger':
        return Colors.error;
      case 'secondary':
        return Colors.backgroundTertiary;
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'text') return Colors.primary;
    if (variant === 'secondary') return Colors.text;
    return Colors.white;
  };

  const getBorderStyle = () => {
    if (variant === 'secondary') {
      return `1px solid ${Colors.border}`;
    }
    return 'none';
  };

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`rounded-xl px-8 py-4 font-semibold text-base transition-all hover:opacity-90 hover:scale-105 disabled:opacity-40 shadow-md ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        border: getBorderStyle(),
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <span>{title}</span>
        </div>
      )}
    </button>
  );
}
