import React from 'react';
import clsx from 'clsx';

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("bg-card border border-border-card rounded-xl shadow-xl overflow-hidden", className)} {...props} />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("px-6 py-4 border-b border-border-card flex flex-col md:flex-row md:items-center justify-between gap-4", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={clsx("text-lg font-bold text-text-primary tracking-tight", className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("p-6", className)} {...props} />
);
