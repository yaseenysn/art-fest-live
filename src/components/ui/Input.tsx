import React from 'react';
import clsx from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full bg-input text-text-primary border border-border-subtle rounded-lg px-4 py-2.5",
        "focus:outline-none focus:border-primary-purple focus:ring-1 focus:ring-primary-purple",
        "placeholder:text-text-muted transition-colors disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';
