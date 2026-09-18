'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { Gamepad2, Landmark, Trophy, Compass } from 'lucide-react';

interface DesktopDockItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
}

const DOCK_ITEMS: DesktopDockItem[] = [
  { id: 'lobby', label: 'Lobby', href: '/', icon: Compass },
  { id: 'games', label: 'Spiele', href: '/games', icon: Gamepad2 },
  { id: 'vault', label: 'VIP Vault', href: '/vault', icon: Landmark },
  { id: 'ranks', label: 'Ränge', href: '/leaderboard', icon: Trophy },
];

const BASE_WIDTH = 96;
const DISTANCE_LIMIT = 120;
const MAGNIFICATION = 1.15;

function DesktopDockButton({
  item,
  mouseX,
  isActive,
}: {
  item: DesktopDockItem;
  mouseX: MotionValue<number>;
  isActive: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = item.icon;

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-DISTANCE_LIMIT, 0, DISTANCE_LIMIT], [
    BASE_WIDTH,
    BASE_WIDTH * MAGNIFICATION,
    BASE_WIDTH,
  ]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 400, damping: 28 });

  const scaleSync = useTransform(distance, [-DISTANCE_LIMIT, 0, DISTANCE_LIMIT], [1.0, 1.08, 1.0]);
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 400, damping: 28 });

  return (
    <Link
      href={item.href}
      style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}
    >
      <motion.div
        ref={ref}
        style={{
          width,
          scale,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          position: 'relative',
          borderRadius: 20,
          cursor: 'pointer',
          userSelect: 'none',
          padding: '0 10px',
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Active Pill Glow */}
        {isActive && (
          <motion.div
            layoutId="desktopActiveDockIndicator"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 20,
              background:
                'linear-gradient(180deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 235, 160, 0.25)',
              zIndex: 0,
            }}
          />
        )}

        {/* Hover Pill Background */}
        {!isActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 20,
              background: 'transparent',
              transition: 'background 0.2s ease, border-color 0.2s ease',
              border: '1px solid transparent',
              zIndex: 0,
            }}
            className="hover:bg-amber-500/10 hover:border-amber-400/20"
          />
        )}

        {/* Icon & Label */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: isActive ? '#D4AF37' : '#94A3B8',
            transition: 'color 0.2s ease',
          }}
        >
          <Icon size={14} color={isActive ? '#D4AF37' : 'currentColor'} />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

export function DesktopHeaderDock() {
  const pathname = usePathname();
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.nav
        aria-label="Desktop Quick Navigation"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          height: 44,
          padding: '0 4px',
        }}
      >
        {DOCK_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <DesktopDockButton
              key={item.id}
              item={item}
              mouseX={mouseX}
              isActive={isActive}
            />
          );
        })}
      </motion.nav>
    </div>
  );
}
