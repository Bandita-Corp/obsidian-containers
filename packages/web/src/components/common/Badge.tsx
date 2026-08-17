import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'gray' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'sm',
  className,
}) => {
  const variantStyles = {
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    gray: 'bg-gray-800 text-gray-400 border border-gray-700/50',
    outline: 'bg-transparent text-gray-400 border border-gray-700',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-mono font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-mono font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 leading-none tracking-wide transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
