'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split current value into array of length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const setDigitAt = useCallback(
    (index: number, char: string) => {
      const newDigits = [...digits];
      newDigits[index] = char;
      const newValue = newDigits.join('').slice(0, length);
      onChange(newValue);
      if (newValue.length === length && onComplete) {
        onComplete(newValue);
      }
    },
    [digits, length, onChange, onComplete]
  );

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        // Clear current
        setDigitAt(index, '');
      } else if (index > 0) {
        // Clear previous and focus previous
        setDigitAt(index - 1, '');
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const rawVal = e.target.value;
    const onlyDigits = rawVal.replace(/\D/g, '');

    if (!onlyDigits) {
      setDigitAt(index, '');
      return;
    }

    // Single character typed
    const char = onlyDigits[onlyDigits.length - 1];
    setDigitAt(index, char);

    // Advance focus
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, length);

    if (pastedDigits) {
      onChange(pastedDigits);
      if (pastedDigits.length === length && onComplete) {
        onComplete(pastedDigits);
      }
      // Focus last filled index or next available
      const nextFocusIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
      }}
      role="group"
      aria-label="Einmal-Code Eingabe"
    >
      {Array.from({ length }).map((_, i) => {
        const isFilled = Boolean(digits[i]);
        return (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[i]}
            disabled={disabled}
            autoComplete="one-time-code"
            aria-label={`Ziffer ${i + 1} von ${length}`}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            style={{
              width: '44px',
              height: '52px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: isFilled
                ? '1px solid hsl(var(--primary))'
                : '1px solid var(--glass-border)',
              color: '#fff',
              fontSize: '1.35rem',
              fontWeight: 800,
              textAlign: 'center',
              fontFamily: 'var(--font-mono, monospace)',
              outline: 'none',
              transition: 'all 0.15s ease',
              boxShadow: isFilled
                ? '0 0 10px rgba(212, 175, 55, 0.25)'
                : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
