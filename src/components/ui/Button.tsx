import React from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-app disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-purple to-primary-indigo text-white shadow-lg shadow-primary-purple/20 hover:shadow-primary-purple/40 hover:from-purple-500 hover:to-indigo-500 focus:ring-primary-purple",
    secondary: "bg-card border border-border-card text-text-secondary hover:bg-row hover:text-white focus:ring-border-card",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 focus:ring-red-500",
    ghost: "bg-transparent text-text-muted hover:text-white hover:bg-card focus:ring-border-card"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      ref={ref}
      className={clsx(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = 'Button';
