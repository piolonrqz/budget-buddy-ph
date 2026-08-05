import React from 'react';

type ButtonVariant = 'primary' | 'dark' | 'soft' | 'outline-light' | 'outline-dark';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'text-sm px-[16px] h-[36px]',
    md: 'text-base px-[28px] h-[48px]',
    lg: 'text-[20px] px-[32px] h-[56px] font-display',
  };

  const variantStyles = {
    'primary': 'bg-canvas-light text-canvas-dark hover:bg-faint',
    'dark': 'bg-canvas-dark text-on-dark hover:bg-surface-elevated dark:bg-canvas-light dark:text-canvas-dark dark:hover:bg-faint',
    'soft': 'bg-surface-soft text-ink hover:bg-hairline-light dark:bg-surface-elevated dark:text-on-dark dark:hover:bg-hairline-strong',
    'outline-light': 'bg-canvas-light text-ink border border-hairline-strong hover:bg-surface-soft dark:bg-canvas-dark dark:text-on-dark dark:border-hairline-dark dark:hover:bg-surface-elevated',
    'outline-dark': 'bg-canvas-dark text-on-dark border border-on-dark hover:bg-surface-elevated dark:bg-canvas-light dark:text-canvas-dark dark:border-canvas-light dark:hover:bg-faint',
  };

  const classes = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
