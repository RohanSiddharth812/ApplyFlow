import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'teal' | 'purple' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className
}) => {
  const variantStyles = {
    primary: 'bg-niagara/10 text-niagara border-niagara/20',
    teal: 'bg-[#E0F7F6] text-niagara border-[#B2EBE9]',
    purple: 'bg-wisteria/20 text-kimberly-dark border-wisteria/40',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium rounded-full border',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-full border',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 transition-colors', variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
};
