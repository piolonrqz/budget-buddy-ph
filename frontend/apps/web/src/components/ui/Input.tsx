import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-2">
        {label && <label className="text-sm font-medium text-ink dark:text-on-dark-mute">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`w-full h-[56px] px-4 rounded-md bg-canvas-light dark:bg-surface-elevated text-ink dark:text-on-dark border border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-2 focus:ring-primary ${error ? 'border-accent-danger' : ''
              } ${isPassword ? 'pr-12' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && <span className="text-sm text-accent-danger">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
