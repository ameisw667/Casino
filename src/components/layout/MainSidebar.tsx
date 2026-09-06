'use client';
import React, { type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import SettingsPopover from '@/components/casino/SettingsPopover';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';

export interface MenuItem {
  label: string;
  path: string;
  onClick?: () => void;
}

interface MainSidebarProps {
  isMobile: boolean;
  mobileSidebarOpen: boolean;
  menuItems: MenuItem[];
  pathname: string;
  showSettings: boolean;
  navigate: (path: string) => void;
  setMobileSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  setShowProvablyFair: Dispatch<SetStateAction<boolean>>;
  setShowSettingsModal: Dispatch<SetStateAction<boolean>>;
}

export function MainSidebar({
  isMobile,
  mobileSidebarOpen,
  menuItems,
  pathname,
  showSettings,
  navigate,
  setMobileSidebarOpen,
  setShowSettings,
  setShowProvablyFair,
  setShowSettingsModal,
}: MainSidebarProps) {
  return (
    <>
      {/* Mobile Drawer Overlay with Adaptive Blur */}
      <AnimatePresence>
        {isMobile && mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 1040,
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar / Mobile Slide Drawer */}
      <motion.aside
        className="glass-sidebar"
        initial={false}
        animate={isMobile ? { x: mobileSidebarOpen ? 0 : '-100%' } : { x: 0 }}
        transition={{
          type: 'spring',
          damping: isMobile ? 24 : 28,
          stiffness: isMobile ? 300 : 320,
        }}
        style={{
          width: isMobile ? '280px' : '240px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: isMobile ? 1050 : 150,
          height: '100vh',
          maxHeight: '100vh',
          position: isMobile ? 'fixed' : 'sticky',
          left: 0,
          top: 0,
          overflow: 'hidden',
          overscrollBehavior: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: isMobile ? '12px' : '0',
            flexShrink: 0,
          }}
        >
          <Link
            href="/"
            onClick={() => {
              if (isMobile) setMobileSidebarOpen(false);
            }}
            style={{
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ width: '40px', height: '40px', position: 'relative', flexShrink: 0 }}>
              <Image
                src="/images/brand-ace-icon.png"
                alt="Casino Royale"
                fill
                sizes="100px"
                style={{ objectFit: 'contain' }}
                className="brand-logo-tilt"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    letterSpacing: '-1px',
                    lineHeight: 1,
                  }}
                >
                  CASINO
                </span>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    background: 'hsl(var(--primary))',
                    color: 'black',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    transform: 'translateY(-2px)',
                  }}
                >
                  PRO
                </span>
              </div>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '0.65rem',
                  color: 'hsl(var(--primary))',
                  letterSpacing: '0.2em',
                  marginTop: '2px',
                }}
              >
                ROYALE
              </span>
            </div>
          </Link>
          {isMobile && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="btn btn-ghost"
              aria-label="Close navigation menu"
              style={{
                width: '36px',
                height: '36px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            padding: '12px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(212, 175, 55, 0.2) transparent',
          }}
        >
          {/* Royale Guide Trigger (Über "Lobby", Option B Event-Trigger) — Option-Gate 2026-09-04: Option A "Row-Wash" (optimiert), zentriert statt linksbündig */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('royale-guide-open-with-prompt'));
              }
              if (isMobile) setMobileSidebarOpen(false);
            }}
            className="btn btn-ghost rg-highlight"
            title="Royale Guide öffnen"
            aria-label="Royale Guide öffnen"
            style={{
              justifyContent: 'center',
              width: '100%',
              marginBottom: '4px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.72)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              className="rg-highlight-icon"
              style={{ width: '28px', height: '28px', position: 'relative', flexShrink: 0 }}
            >
              <Image
                src="/images/royale-guide-mascot-icon.png"
                alt=""
                fill
                sizes="28px"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span>Royale Guide</span>
          </button>

          {menuItems.map((item) => {
            const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            const isSettings = item.label === 'Settings';
            return (
              <React.Fragment key={item.label}>
                <button
                  onClick={item.onClick || (() => navigate(item.path))}
                  className="btn btn-ghost"
                  data-sidebar-nav-item
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    minHeight: '44px',
                    marginBottom: '4px',
                    color:
                      active || (isSettings && showSettings)
                        ? '#D4AF37'
                        : 'rgba(255, 255, 255, 0.72)',
                    background:
                      active || (isSettings && showSettings)
                        ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.16) 0%, rgba(212, 175, 55, 0.03) 100%)'
                        : 'transparent',
                    borderLeft:
                      active || (isSettings && showSettings)
                        ? '3px solid #D4AF37'
                        : '3px solid transparent',
                    boxShadow:
                      active || (isSettings && showSettings)
                        ? '0 0 16px rgba(212, 175, 55, 0.12)'
                        : 'none',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: active || (isSettings && showSettings) ? 700 : 600,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <span>{item.label}</span>
                </button>
                {isSettings && (
                  <SettingsPopover
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    onOpenProvablyFair={() => {
                      setShowSettings(false);
                      setMobileSidebarOpen(false);
                      setShowProvablyFair(true);
                    }}
                    onExpandModal={() => {
                      setShowSettings(false);
                      setMobileSidebarOpen(false);
                      setShowSettingsModal(true);
                    }}
                    inline
                  />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        <div
          style={{
            flexShrink: 0,
            margin: '20px',
            padding: '16px',
            background: 'hsla(0,0%,100%,0.02)',
            borderRadius: '16px',
            border: '1px solid hsla(0,0%,100%,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ width: '32px', height: '32px', position: 'relative', flexShrink: 0 }}>
            <Image
              src="/images/trust-shield-3d.png"
              alt="Secure"
              fill
              sizes="20px"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white' }}>
              SECURE & FAIR
            </div>
            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'hsl(var(--success))' }}>
              CERTIFIED
            </div>
          </div>
        </div>
        <ConsentBanner />
      </motion.aside>
    </>
  );
}
