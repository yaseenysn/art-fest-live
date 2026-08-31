import React from 'react';
import clsx from 'clsx';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  ...props
}, ref) => {
  return (
    <select
      ref={ref}
      className={clsx(
        "w-full bg-input text-text-primary border border-border-subtle rounded-lg px-4 py-2.5",
        "focus:outline-none focus:border-primary-purple focus:ring-1 focus:ring-primary-purple",
        "transition-colors disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Select.displayName = 'Select';
