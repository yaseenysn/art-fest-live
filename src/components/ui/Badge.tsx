import React from 'react';
import clsx from 'clsx';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'success' | 'info' | 'warning' | 'purple' | 'default' | 'danger';
};

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    warning: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    purple: "bg-primary-purple/10 text-primary-purple border border-primary-purple/20",
    default: "bg-card border border-border-card text-text-secondary"
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
