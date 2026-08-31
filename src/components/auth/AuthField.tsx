'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Input Field Component with Password Visibility Toggle (No Float / Hover Shift Bug)
export function AuthField({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  error,
  disabled,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPasswordField = type === 'password';
  const effectiveType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: disabled ? 0.6 : 1 }}
    >
      <label
        htmlFor={id}
        style={{
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.75)',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </label>

      {/* Input container with CSS classes for hover & focus states */}
      <div
        className="auth-input-wrapper"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '12px',
          background: isFocused ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.04)',
          border: error
            ? '1px solid rgba(255, 51, 102, 0.6)'
            : isFocused
              ? '1px solid rgba(212, 175, 55, 0.8)'
              : '1px solid var(--glass-border)',
          boxShadow: error
            ? '0 0 12px rgba(255, 51, 102, 0.2)'
            : isFocused
              ? '0 0 16px rgba(212, 175, 55, 0.25)'
              : 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
        }}
      >
        <input
          id={id}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          style={{
            width: '100%',
            height: '46px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: isPasswordField ? '0 44px 0 14px' : '0 14px',
            color: '#FFFFFF',
            fontSize: '0.92rem',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />

        {/* Password visibility toggle button inside input box */}
        {isPasswordField && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: showPassword ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Inline Field Validation Error Message */}
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: '#ff3366',
            fontWeight: 600,
            marginTop: '2px',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
