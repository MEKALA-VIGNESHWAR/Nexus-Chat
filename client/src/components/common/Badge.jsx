import React from 'react';

export default function Badge({
  children,
  variant = 'primary', // primary, success, warning, danger, neutral
  size = 'sm', // xs, sm, md
  className = '',
}) {
  const variants = {
    primary: 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
    neutral: 'bg-slate-600/30 text-slate-400 ring-1 ring-slate-500/30',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
