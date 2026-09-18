'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

export interface DockItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface MagneticDockProps {
  items: DockItem[];
  className?: string;
}

const BASE_WIDTH = 54;
const DISTANCE_LIMIT = 130;
const MAGNIFICATION = 1.32;

function DockIconItem({
  item,
  mouseX,
}: {
  item: DockItem;
  mouseX: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-DISTANCE_LIMIT, 0, DISTANCE_LIMIT], [
    BASE_WIDTH,
    BASE_WIDTH * MAGNIFICATION,
    BASE_WIDTH,
  ]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 350, damping: 22 });

  const ySync = useTransform(distance, [-DISTANCE_LIMIT, 0, DISTANCE_LIMIT], [0, -6, 0]);
  const y = useSpring(ySync, { mass: 0.1, stiffness: 350, damping: 22 });

  const content = (
    <motion.div
      ref={ref}
      style={{
        width,
        y,
        height: 52,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: 16,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      whileTap={{ scale: 0.92 }}
      className="group"
    >
      {/* Active Gold Indicator / Ambient Pill Glow */}
      {item.isActive && (
        <motion.div
          layoutId="activeDockIndicator"
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            background:
              'radial-gradient(circle at 50% 100%, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.04) 70%, transparent 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            boxShadow:
              '0 0 16px rgba(212, 175, 55, 0.25), inset 0 1px 0 rgba(255, 235, 160, 0.2)',
            zIndex: 0,
          }}
        />
      )}

      {/* Icon with Dynamic Color */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: item.isActive ? '#d4af37' : 'rgba(240, 240, 245, 0.72)',
          filter: item.isActive
            ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))'
            : 'none',
          transition: 'color 0.2s, filter 0.2s',
        }}
      >
        {item.icon}
      </div>

      {/* Micro-Label (Obsidian & Gold Luxury Typography) */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: '0.62rem',
          fontWeight: item.isActive ? 800 : 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginTop: 2,
          color: item.isActive ? '#d4af37' : 'rgba(180, 185, 200, 0.75)',
          fontFamily: 'var(--font-mono, monospace)',
          transition: 'color 0.2s',
        }}
      >
        {item.label}
      </span>

      {/* Tiny active gold dot below */}
      {item.isActive && (
        <span
          style={{
            position: 'absolute',
            bottom: 3,
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#d4af37',
            boxShadow: '0 0 6px #d4af37',
            zIndex: 1,
          }}
        />
      )}
    </motion.div>
  );

  if (item.path) {
    return (
      <Link
        href={item.path}
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={item.onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {content}
    </button>
  );
}

export function MagneticDock({ items, className = '' }: MagneticDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
 onMouseLeave={() => mouseX.set(Infinity)}
 onTouchMove={(e) => {
 if (e.touches[0]) {
 mouseX.set(e.touches[0].pageX);
 }
 }}
 onTouchEnd={() => mouseX.set(Infinity)}
 className={className}
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: 6,
 padding: '6px 10px',
 borderRadius: 24,
 background: 'rgba(11, 14, 20, 0.88)',
 backdropFilter: 'blur(24px) saturate(180%)',
 WebkitBackdropFilter: 'blur(24px) saturate(180%)',
 border: '1px solid rgba(212, 175, 55, 0.22)',
 boxShadow:
 '0 12px 36px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 1px 24px rgba(212, 175, 55, 0.12)',
 }}
 >
 {items.map((item, index) => (
 <DockIconItem key={item.label || index} item={item} mouseX={mouseX} />
 ))}
 </motion.div>
 );
}
