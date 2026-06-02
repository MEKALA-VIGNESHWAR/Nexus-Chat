import React from 'react';

export default function Skeleton({
  variant = 'text', // text, circular, rectangular
  width,
  height,
  className = '',
}) {
  const baseStyles = 'bg-slate-800 animate-pulse';
  
  const variants = {
    text: 'h-3 rounded-md w-3/4 mb-2.5',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={style}
    />
  );
}
