import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'plan' | 'plan-featured' | 'glass' | 'glass-dark';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'light',
  className = '',
  ...props 
}) => {
  const baseStyles = 'rounded-lg p-xxl overflow-hidden';
  
  const variantStyles = {
    'light': 'bg-surface-card text-ink border border-hairline-light dark:bg-surface-elevated dark:text-on-dark dark:border-hairline-dark',
    'dark': 'bg-surface-elevated text-on-dark',
    'plan': 'bg-surface-elevated text-on-dark',
    'plan-featured': 'bg-primary text-on-primary',
    'glass': 'glass text-ink',
    'glass-dark': 'glass-dark text-on-dark'
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
