'use client';
import { Menu, LogIn, UserPlus, LogOut, Keyboard } from 'lucide-react';
import { IconBadge } from '@/components/layout/IconBadge';
import { AuthHeaderBtn } from '@/components/layout/AuthHeaderBtn';
import { NotificationCenter } from '@/components/layout/NotificationCenter';
import { DesktopHeaderDock } from '@/components/casino/navigation/DesktopHeaderDock';
import { WalletTextMorphChip } from './WalletTextMorphChip';

interface MainHeaderProps {
  isMobile: boolean;
  rank: string;
  level: number;
  progress: number;
  balance: number;
  hideBalance: boolean;
  displayName: string;
  effectiveIsSignedIn: boolean;
  notificationUserId: string | null;
  onShowRankInfo: () => void;
  onToggleHideBalance: () => void;
  onSignOut: () => void;
  onOpenMobileSidebar: () => void;
}

export function MainHeader({
  isMobile,
  rank,
  level,
  progress,
  balance,
  hideBalance,
  displayName,
  effectiveIsSignedIn,
  notificationUserId,
  onShowRankInfo,
  onToggleHideBalance,
  onSignOut,
  onOpenMobileSidebar,
}: MainHeaderProps) {
  return (
    <header
      className="glass-header"
      style={{
        height: isMobile ? '64px' : '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 8px' : '0 24px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        {isMobile && (
          <button
            onClick={onOpenMobileSidebar}
            className="btn btn-ghost no-mobile-minheight"
            aria-label="Open navigation menu"
            style={{ padding: '8px' }}
          >
            <Menu size={20} />
          </button>
        )}
        <button
          onClick={onShowRankInfo}
          className={
            isMobile
              ? 'header-chip header-chip-gold no-mobile-minheight'
              : 'no-mobile-minheight'
          }
          style={{
            padding: isMobile ? '4px 8px' : '6px 12px 6px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '10px',
            cursor: 'pointer',
            background: isMobile ? undefined : 'transparent',
            border: isMobile ? undefined : '1px solid transparent',
            borderRadius: isMobile ? undefined : '12px',
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isMobile) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }
          }}
        >
          {!isMobile && (
            <IconBadge tone="gold">
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  backgroundColor: '#000',
                  WebkitMask: 'url(/images/2026-09-06_icon-star-level-quantum-gold_v001.webp) center / contain no-repeat',
                  mask: 'url(/images/2026-09-06_icon-star-level-quantum-gold_v001.webp) center / contain no-repeat',
                }}
              />
            </IconBadge>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {!isMobile && (
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  color: 'hsl(var(--primary))',
                  textTransform: 'uppercase',
                }}
              >
                {rank}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {isMobile && (
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    backgroundColor: 'hsl(var(--primary))',
                    WebkitMask: 'url(/images/2026-09-06_icon-star-level-quantum-gold_v001.webp) center / contain no-repeat',
                    mask: 'url(/images/2026-09-06_icon-star-level-quantum-gold_v001.webp) center / contain no-repeat',
                  }}
                />
              )}
              <span
                style={{
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  color: 'hsl(var(--text-main))',
                  fontWeight: 700,
                }}
              >
                {isMobile ? `L${level}` : `LVL ${level}`}
              </span>
            </div>
          </div>
          {!isMobile && (
            <div
              style={{
                width: '80px',
                height: '4px',
                background: 'hsla(0, 0%, 100%, 0.05)',
                borderRadius: '2px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
                  borderRadius: '2px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          )}
        </button>
        {!isMobile && (
          <div
            aria-hidden="true"
            style={{
              width: 1,
              height: 28,
              background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              marginLeft: 4,
            }}
          />
        )}
      </div>
 
      {!isMobile && <DesktopHeaderDock />}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '12px',
          paddingRight: isMobile ? '8px' : '0',
        }}
      >
        {!isMobile && (
          <div
            aria-hidden="true"
            style={{
              width: 1,
              height: 28,
              background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              marginRight: 2,
            }}
          />
        )}
        <WalletTextMorphChip
          balance={balance}
          hideBalance={hideBalance}
          onToggleHideBalance={onToggleHideBalance}
          isMobile={isMobile}
        />

        {!isMobile && (
          <div
            aria-hidden="true"
            style={{
              width: 1,
              height: 28,
              background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px' }}>
          <NotificationCenter userId={notificationUserId} isMobile={isMobile} />
          {!isMobile && (
            <>
              {!effectiveIsSignedIn ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AuthHeaderBtn href="/sign-in" variant="glass">
                    <LogIn size={13} strokeWidth={2.5} />
                    LOGIN
                  </AuthHeaderBtn>
                  <AuthHeaderBtn href="/sign-up" variant="gold">
                    <UserPlus size={13} strokeWidth={2.5} />
                    REGISTER
                  </AuthHeaderBtn>
                  <button
                    type="button"
                    data-testid="keyboard-shortcuts-trigger-guest"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts'))}
                    title="Tastatur-Shortcuts (?)"
                    aria-label="Tastatur-Shortcuts (?)"
                    className="hover:text-[#D4AF37] hover:border-[rgba(212,175,55,0.45)] hover:bg-[rgba(212,175,55,0.08)] transition-all duration-150"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'rgba(255, 255, 255, 0.55)',
                      fontSize: '0.58rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                  >
                    <Keyboard size={10} color="#D4AF37" />
                    <span style={{ fontFamily: 'monospace', color: '#D4AF37', fontWeight: 700 }}>?</span>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '4px 6px',
                  }}
                >
                  <div style={{ textAlign: 'right', paddingRight: '2px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
                      {displayName}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '6px',
                        marginTop: '3px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          color: 'hsl(var(--primary))',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          lineHeight: 1,
                        }}
                      >
                        {rank}
                      </span>
                      <button
                        type="button"
                        data-testid="keyboard-shortcuts-trigger"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts'))}
                        title="Tastatur-Shortcuts (?)"
                        aria-label="Tastatur-Shortcuts (?)"
                        className="hover:text-[#D4AF37] hover:border-[rgba(212,175,55,0.45)] hover:bg-[rgba(212,175,55,0.1)] transition-all duration-150"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '1.5px 5px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontSize: '0.55rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          lineHeight: 1,
                        }}
                      >
                        <Keyboard size={9} color="rgba(212, 175, 55, 0.75)" />
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#D4AF37', fontWeight: 700 }}>?</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={onSignOut}
                    aria-label="Abmelden"
                    className="btn btn-ghost"
                    style={{
                      width: '36px',
                      height: '36px',
                      padding: 0,
                      borderRadius: '10px',
                      border: '1px solid hsla(var(--primary), 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              )}
            </>
          )}
          {isMobile &&
            (effectiveIsSignedIn ? (
              <button
                onClick={onSignOut}
                aria-label="Abmelden"
                className="btn btn-ghost"
                style={{ padding: '8px' }}
              >
                <LogOut size={16} />
              </button>
            ) : (
              <AuthHeaderBtn href="/sign-in" variant="glass" compact>
                <LogIn size={13} strokeWidth={2.5} />
                LOGIN
              </AuthHeaderBtn>
            ))}
        </div>
      </div>
    </header>
  );
}
