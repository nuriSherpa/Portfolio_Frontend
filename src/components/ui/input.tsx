// components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-admin-text-primary mb-1.5">
            {label}
            {props.required && <span className="text-admin-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={`
              w-full bg-white border rounded-lg px-4 py-2.5 text-sm
              placeholder:text-admin-text-muted
              focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all
              ${leftIcon ? 'pl-10' : ''}
              ${isPassword ? 'pr-10' : ''}
              ${
                error
                  ? 'border-admin-danger focus:ring-admin-danger/20 focus:border-admin-danger'
                  : 'border-admin-border focus:ring-admin-primary-500/20 focus:border-admin-primary-500'
              }
              ${className}
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-admin-text-secondary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-1.5 flex items-center text-sm text-admin-danger">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            {error}
          </div>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-admin-text-muted">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
