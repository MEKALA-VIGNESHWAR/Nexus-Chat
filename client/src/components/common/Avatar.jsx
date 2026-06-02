import React from 'react';

export default function Avatar({
  src,
  alt = 'avatar',
  size = 'md', // xs, sm, md, lg, xl
  status = null, // online, offline, none
  className = '',
  onClick,
}) {
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const statusSizes = {
    xs: 'h-1.5 w-1.5 ring-1',
    sm: 'h-2 w-2 ring-1',
    md: 'h-2.5 w-2.5 ring-2',
    lg: 'h-3 w-3 ring-2',
    xl: 'h-4 w-4 ring-2',
  };

  // Build a generic fallback avatar based on username initial letter
  const initial = alt ? alt.charAt(0).toUpperCase() : '?';

  return (
    <div 
      className={`relative inline-flex flex-shrink-0 cursor-pointer ${onClick ? 'active:scale-95 transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`rounded-full object-cover border border-slate-800/50 ${sizes[size]}`}
          onError={(e) => {
            // Fallback to text initials if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      {/* Initials Fallback */}
      <div
        className={`rounded-full bg-indigo-600/80 border border-indigo-500/20 text-white font-bold items-center justify-center capitalize ${sizes[size]} ${src ? 'hidden' : 'flex'}`}
      >
        {initial}
      </div>

      {/* Online/Offline Status Indicator Badge */}
      {status && status !== 'none' && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-slate-900 ${
            status === 'online' ? 'bg-green-500' : 'bg-slate-500'
          } ${statusSizes[size]}`}
        />
      )}
    </div>
  );
}
