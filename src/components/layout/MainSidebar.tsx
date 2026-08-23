'use client';
import React, { type Dispatch, type ReactNode, type SetStateAction } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import SettingsPopover from '@/components/casino/SettingsPopover';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';

export interface MenuItem {
  icon: ReactNode;
  label: string;
  path: string;
  onClick?: () => void;
}

interface MainSidebarProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  showExpandedSidebar: boolean;
  menuItems: MenuItem[];
  pathname: string;
  showSettings: boolean;
  navigate: (path: string) => void;
  setMobileSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  setShowProvablyFair: Dispatch<SetStateAction<boolean>>;
  setShowSettingsModal: Dispatch<SetStateAction<boolean>>;
}

export function MainSidebar({
  isMobile,
  sidebarOpen,
  mobileSidebarOpen,
  showExpandedSidebar,
  menuItems,
  pathname,
  showSettings,
  navigate,
  setMobileSidebarOpen,
  setSidebarOpen,
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
        animate={
          isMobile
            ? { x: mobileSidebarOpen ? 0 : '-100%' }
            : { x: 0, width: sidebarOpen ? 240 : 80 }
        }
        transition={{
          type: 'spring',
          damping: isMobile ? 24 : 28,
          stiffness: isMobile ? 300 : 320,
        }}
        style={{
          width: isMobile ? '280px' : undefined,
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
                src="/images/brand-medallion-3d.png"
                alt="Casino Royale"
                fill
                sizes="100px"
                style={{ objectFit: 'contain' }}
                className="animate-pulse"
              />
            </div>
            {showExpandedSidebar && (
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
            )}
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
          {menuItems.map((item) => {
            const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            const isSettings = item.label === 'Settings';
            const content = (
              <>
                {item.icon}
                {showExpandedSidebar && <span>{item.label}</span>}
              </>
            );
            return (
              <React.Fragment key={item.label}>
                <button
                  onClick={item.onClick || (() => navigate(item.path))}
                  className="btn btn-ghost"
                  aria-label={item.label}
                  style={{
                    justifyContent: showExpandedSidebar ? 'flex-start' : 'center',
                    width: '100%',
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
                    padding: showExpandedSidebar ? '10px 14px' : '10px',
                    borderRadius: '8px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {content}
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

        {showExpandedSidebar && (
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
        )}
        {showExpandedSidebar && <ConsentBanner />}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{
              flexShrink: 0,
              margin: '12px',
              padding: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              color: 'rgba(255,255,255,0.4)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
      </motion.aside>
    </>
  );
}
