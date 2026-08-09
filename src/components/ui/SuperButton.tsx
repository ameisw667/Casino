'use client';
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Magnetic } from './Magnetic';
import { ParticleBurst, type ParticleBurstHandle } from './ParticleBurst';
import { RippleContainer } from './RippleContainer';
import { soundManager } from '@/lib/casino/sound-manager';

interface SuperButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  enableParticles?: boolean;
  enableSound?: boolean;
  enableHaptic?: boolean;
}

const SIZE_STYLES = {
  sm: { padding: '6px 12px', fontSize: '0.75rem', height: '32px' },
  md: { padding: '10px 20px', fontSize: '0.875rem', height: '40px' },
  lg: { padding: '14px 28px', fontSize: '1rem', height: '52px' },
  xl: { padding: '18px 36px', fontSize: '1.25rem', height: '68px' },
};

const VARIANT_STYLES = {
  primary: {
    background: 'hsl(var(--primary))',
    color: '#000',
    boxShadow: '0 4px 15px hsla(var(--primary), 0.4)',
    hoverScale: 1.03,
  },
  secondary: {
    background: 'hsla(0, 0%, 100%, 0.05)',
    color: '#fff',
    border: '1px solid hsla(0, 0%, 100%, 0.1)',
    hoverScale: 1.02,
  },
  ghost: {
    background: 'transparent',
    color: 'hsl(var(--text-muted))',
    hoverScale: 1.01,
  },
  danger: {
    background: 'hsl(var(--error))',
    color: '#fff',
    boxShadow: '0 4px 15px hsla(var(--error), 0.4)',
    hoverScale: 1.03,
  },
};

/**
 * SuperButton - Ultimate interactive button with all micro-interactions
 *
 * Combines:
 * - Magnetic hover pull
 * - Particle burst on click
 * - Ripple effect on click
 * - Sound feedback (optional)
 * - Haptic feedback (mobile, optional)
 * - Smooth scale/tilt animations
 */
export const SuperButton: React.FC<SuperButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className,
  style,
  enableParticles = true,
  enableSound = true,
  enableHaptic = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleBurstRef = useRef<ParticleBurstHandle>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      if (enableParticles) {
        particleBurstRef.current?.fire();
      }

      if (enableSound) {
        soundManager.play('click');
      }

      if (enableHaptic && navigator.vibrate) {
        navigator.vibrate(10);
      }

      onClick?.(e);
    },
    [disabled, loading, enableParticles, enableSound, enableHaptic, onClick],
  );

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <Magnetic strength={0.3}>
      <RippleContainer
        rippleColor={variant === 'primary' ? 'hsla(45, 100%, 50%, 0.4)' : 'hsla(0, 0%, 100%, 0.2)'}
      >
        <motion.button
          ref={buttonRef}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={className}
          disabled={disabled || loading}
          style={{
            ...sizeStyle,
            ...variantStyle,
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            ...style,
          }}
          animate={{
            scale: isHovered && !disabled ? variantStyle.hoverScale : 1,
            y: isHovered && !disabled ? -2 : 0,
          }}
          whileTap={{ scale: 0.96 }}
        >
          {/* Glow effect on hover */}
          {isHovered && !disabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at center, hsla(var(--primary), 0.2) 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Loading spinner */}
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
              }}
            />
          )}

          {/* Content */}
          <span style={{ opacity: loading ? 0 : 1, position: 'relative', zIndex: 1 }}>
            {children}
          </span>

          {/* Particle burst overlay */}
          <ParticleBurst
            ref={particleBurstRef}
            colors={
              variant === 'primary'
                ? ['#FFD700', '#FFF', 'hsl(var(--secondary))']
                : variant === 'danger'
                  ? ['#FF4444', '#FFF', '#FF8888']
                  : ['#FFF', 'hsl(var(--primary))', 'hsl(var(--accent))']
            }
          />
        </motion.button>
      </RippleContainer>
    </Magnetic>
  );
};
