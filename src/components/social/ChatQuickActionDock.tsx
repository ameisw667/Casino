'use client';

import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';

interface ChatQuickAction {
  id: string;
  emoji: string;
  label: string;
  insertText: string;
}

const CHAT_ACTIONS: ChatQuickAction[] = [
  { id: 'fire', emoji: '🔥', label: 'Hot Streak', insertText: '🔥' },
  { id: 'jackpot', emoji: '💰', label: 'Big Win', insertText: '💰' },
  { id: 'luck', emoji: '🍀', label: 'Good Luck', insertText: '🍀' },
  { id: 'vip', emoji: '💎', label: 'VIP Club', insertText: '💎' },
  { id: 'dice', emoji: '🎲', label: 'Roll It', insertText: '🎲' },
  { id: 'cheers', emoji: '🥂', label: 'Cheers', insertText: '🥂' },
  { id: 'tip', emoji: '🪙', label: 'Tip Host', insertText: '/tip ' },
];

const BASE_WIDTH = 34;
const DISTANCE_LIMIT = 90;
const MAGNIFICATION = 1.35;

function ActionItem({
  action,
  mouseX,
  onSelect,
  isReducedMotion,
}: {
  action: ChatQuickAction;
  mouseX: MotionValue<number>;
  onSelect: (text: string) => void;
  isReducedMotion: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distance,
    [-DISTANCE_LIMIT, 0, DISTANCE_LIMIT],
    [BASE_WIDTH, BASE_WIDTH * MAGNIFICATION, BASE_WIDTH],
  );
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 400, damping: 26 });

  const ySync = useTransform(distance, [-DISTANCE_LIMIT, 0, DISTANCE_LIMIT], [0, -4, 0]);
  const y = useSpring(ySync, { mass: 0.1, stiffness: 400, damping: 26 });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => onSelect(action.insertText)}
      style={{
        width: isReducedMotion ? BASE_WIDTH : width,
        y: isReducedMotion ? 0 : y,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: 10,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        cursor: 'pointer',
        userSelect: 'none',
        padding: 0,
        fontSize: '1rem',
        outline: 'none',
      }}
      whileHover={{
        backgroundColor: 'rgba(212, 175, 55, 0.12)',
        borderColor: 'rgba(212, 175, 55, 0.45)',
        boxShadow: '0 0 12px rgba(212, 175, 55, 0.25)',
      }}
      whileTap={{ scale: 0.9 }}
      title={action.label}
      aria-label={action.label}
    >
      <span style={{ transform: 'translateY(-0.5px)' }}>{action.emoji}</span>
    </motion.button>
  );
}

export function ChatQuickActionDock({
  onSelectAction,
}: {
  onSelectAction: (insertText: string) => void;
}) {
  const mouseX = useMotionValue(Infinity);
  const prefersReduced = useReducedMotion();
  const isReduced = Boolean(prefersReduced);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        background: 'rgba(11, 14, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#D4AF37',
          opacity: 0.9,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#D4AF37',
            boxShadow: '0 0 6px #D4AF37',
            display: 'inline-block',
          }}
        />
        Quick Bar
      </span>

      <div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {CHAT_ACTIONS.map((action) => (
          <ActionItem
            key={action.id}
            action={action}
            mouseX={mouseX}
            onSelect={onSelectAction}
            isReducedMotion={isReduced}
          />
        ))}
      </div>
    </div>
  );
}
