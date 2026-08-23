'use client';
import { Menu, Star, Users, Wallet, Eye, EyeOff, LogIn, UserPlus, LogOut } from 'lucide-react';
import { IconBadge } from '@/components/layout/IconBadge';
import { AuthHeaderBtn } from '@/components/layout/AuthHeaderBtn';

interface MainHeaderProps {
  isMobile: boolean;
  rank: string;
  level: number;
  progress: number;
  communityWagered: number;
  communityGoal: number;
  balance: number;
  hideBalance: boolean;
  displayName: string;
  effectiveIsSignedIn: boolean;
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
  communityWagered,
  communityGoal,
  balance,
  hideBalance,
  displayName,
  effectiveIsSignedIn,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
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
          className="header-chip header-chip-gold no-mobile-minheight"
          style={{
            padding: isMobile ? '4px 8px' : '6px 12px 6px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '10px',
            cursor: 'pointer',
          }}
        >
          {!isMobile && (
            <IconBadge tone="gold">
              <Star size={12} color="#000" fill="#000" />
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
                <Star size={10} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
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
            className="header-chip"
            style={{
              padding: '6px 12px 6px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '150px',
            }}
          >
            <IconBadge tone="green">
              <Users size={12} color="#000" />
            </IconBadge>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  color: 'hsl(var(--text-muted))',
                }}
              >
                <span>COMMUNITY</span>
                <span>{Math.round((communityWagered / communityGoal) * 100)}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'hsla(0, 0%, 100%, 0.05)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (communityWagered / communityGoal) * 100)}%`,
                    height: '100%',
                    background: '#00e701',
                    boxShadow: '0 0 10px #00e701',
                    borderRadius: '2px',
                    transition: 'width 1s ease',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '16px',
          paddingRight: isMobile ? '8px' : '0',
        }}
      >
        <div
          className="header-chip"
          style={{
            padding: isMobile ? '6px 10px 6px 6px' : '6px 16px 6px 6px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '10px',
          }}
        >
          <IconBadge tone="gold" size={isMobile ? 22 : 26}>
            <Wallet size={isMobile ? 11 : 13} color="#000" />
          </IconBadge>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'hsl(var(--text-main))',
              fontWeight: 800,
              fontSize: isMobile ? '0.9rem' : '1.15rem',
              letterSpacing: '-0.01em',
              maxWidth: isMobile ? '130px' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {hideBalance
              ? '••••••'
              : `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </span>
          <button
            onClick={onToggleHideBalance}
            className="no-mobile-minheight"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsla(0,0%,100%,0.3)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hideBalance ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '4px 8px',
                    background: 'hsla(0,0%,100%,0.03)',
                    borderRadius: '16px',
                    border: '1px solid hsla(0,0%,100%,0.05)',
                  }}
                >
                  <div style={{ textAlign: 'right', paddingRight: '4px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>
                      {displayName}
                    </div>
                    <div
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        color: 'hsl(var(--primary))',
                        textTransform: 'uppercase',
                      }}
                    >
                      {rank}
                    </div>
                  </div>
                  <button
                    onClick={onSignOut}
                    aria-label="Abmelden"
                    className="btn btn-ghost"
                    style={{
                      width: '40px',
                      height: '40px',
                      padding: 0,
                      borderRadius: '12px',
                      border: '2px solid hsla(var(--primary), 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LogOut size={16} />
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
