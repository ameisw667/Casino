'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sun, Moon, Sunset, Sunrise, Clock } from 'lucide-react';
import { useDynamicColor } from '@/hooks/useDynamicColor';
import { Magnetic } from './Magnetic';

const THEME_ICONS: Record<string, React.ReactNode> = {
  dawn: <Sunrise size={16} />,
  day: <Sun size={16} />,
  dusk: <Sunset size={16} />,
  night: <Moon size={16} />,
  midnight: <Clock size={16} />,
};

export const ThemeSelector: React.FC = () => {
  const {
    themeName,
    isAdapting,
    setManualTheme,
    resetToAuto,
    availableThemes,
  } = useDynamicColor();

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <Magnetic>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-secondary"
          style={{
            padding: '8px 12px',
            gap: '8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 800,
          }}
        >
          <Palette size={16} />
          {isAdapting ? 'AUTO' : themeName.toUpperCase()}
        </button>
      </Magnetic>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              padding: '12px',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              zIndex: 100,
              minWidth: '200px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '4px' }}>
                CURRENT THEME
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center' }}>
                {THEME_ICONS[themeName]}
                <span style={{ marginLeft: '6px' }}>{themeName.toUpperCase()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={resetToAuto}
                className="btn btn-ghost"
                style={{
                  justifyContent: 'flex-start',
                  background: isAdapting ? 'hsla(var(--primary), 0.1)' : 'transparent',
                  color: isAdapting ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <Clock size={14} />
                <span>Auto-Adapt</span>
              </button>

              {availableThemes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    const idx = ['dawn', 'day', 'dusk', 'night', 'midnight'].indexOf(theme);
                    if (idx >= 0) setManualTheme(idx);
                  }}
                  className="btn btn-ghost"
                  style={{
                    justifyContent: 'flex-start',
                    background: !isAdapting && themeName === theme ? 'hsla(var(--primary), 0.1)' : 'transparent',
                    color: !isAdapting && themeName === theme ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {THEME_ICONS[theme]}
                  <span style={{ marginLeft: '6px', textTransform: 'capitalize' }}>{theme}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
