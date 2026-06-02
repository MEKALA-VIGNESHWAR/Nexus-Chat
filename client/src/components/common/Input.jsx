import React from 'react';

export default function Input({
  label,
  type = 'text',
  placeholder = '',
  name,
  value,
  error,
  required = false,
  className = '',
  onChange,
  ...props
}) {
  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2.5 bg-slate-900 border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
        } rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-150`}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-red-500 mt-1 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
}
