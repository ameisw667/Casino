'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  TrendingUp, 
  RotateCcw, 
  CircleDollarSign, 
  Trophy, 
  Users, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Play, 
  ExternalLink, 
  Rocket,
  CheckCircle2,
  Gift,
  MousePointerClick,
  Clock,
  ChevronRight,
  Star,
  Gamepad2,
  Wallet,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function Home() {
  const { isMobile, startOnboarding } = useCasinoStore();
  const [liveStats, setLiveStats] = useState({ totalPaid: 14820411.00, activeOffers: 1624, timeToReward: '17m 12s' });
  const [lastPayoutTime, setLastPayoutTime] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        totalPaid: prev.totalPaid + (Math.random() * 2.5),
      }));
      setLastPayoutTime(prev => (prev > 2 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const featuredGames = [
    { 
      id: 'crash', 
      name: 'CRASH', 
      image: '/images/game-crash-new.png', 
      path: '/games/crash', 
      color: 'hsl(var(--primary))', 
      players: 142,
      reward: '$500.00',
      task: 'Hit a 50x Multiplier',
      tag: 'HOT OFFER',
      difficulty: 'Hard'
    },
    { 
      id: 'dice', 
      name: 'DICE', 
      image: '/images/game-dice-new.png', 
      path: '/games/dice', 
      color: 'hsl(var(--secondary))', 
      players: 85,
      reward: '$25.00',
      task: 'Win 10 rounds in a row',
      tag: 'EASY',
      difficulty: 'Beginner'
    },
    { 
      id: 'roulette', 
      name: 'ROULETTE', 
      image: '/images/game-roulette-new.png', 
      path: '/games/roulette', 
      color: 'hsl(var(--accent))', 
      players: 42,
      reward: '$100.00',
      task: 'Bet on Green & Win',
      tag: 'FEATURED',
      difficulty: 'Medium'
    },
    { 
      id: 'slots', 
      name: 'SLOTS', 
      image: '/images/game-slots-new.png', 
      path: '/games/slots', 
      color: 'hsl(var(--primary))', 
      players: 64,
      reward: '$1,000.00',
      task: 'Hit a Mega Jackpot',
      tag: 'JACKPOT',
      difficulty: 'Expert'
    },
  ];

  const liveWithdrawals = [
    { user: 'Bochmann88', amount: '182.00', currency: 'PayPal', time: 'Just now', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    { user: 'Lenny_C', amount: '45.50', currency: 'Litecoin', time: '2m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    { user: 'SarahSlot', amount: '1,200.00', currency: 'Bitcoin', time: '5m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    { user: 'CryptoDan', amount: '12.40', currency: 'Ethereum', time: '8m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
    { user: 'VibeGamer', amount: '90.00', currency: 'PayPal', time: '12m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
  ];

  const ladderSteps = [
    { day: 1, amount: 0.10, tier: 'Bronze' },
    { day: 2, amount: 0.25, tier: 'Bronze' },
    { day: 3, amount: 0.50, tier: 'Bronze' },
    { day: 4, amount: 1.00, tier: 'Silver' },
    { day: 5, amount: 2.50, tier: 'Silver' },
    { day: 6, amount: 5.00, tier: 'Silver' },
    { day: 7, amount: 10.00, tier: 'Gold' },
    { day: 8, amount: 25.00, tier: 'Gold' },
    { day: 9, amount: 50.00, tier: 'Gold' },
    { day: 10, amount: 100.00, tier: 'Diamond' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      
      {/* Top Trust Bar */}
      <div style={{ 
        background: 'hsla(var(--primary), 0.1)', 
        borderBottom: '1px solid hsla(var(--primary), 0.2)',
        padding: '12px 0',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="hsl(var(--primary))" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>PAID OUT IN LAST 30 DAYS: <span style={{ color: '#fff' }}>${liveStats.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="hsl(var(--primary))" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>AVG. TIME TO FIRST REWARD: <span style={{ color: '#fff' }}>{liveStats.timeToReward}</span></span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="hsl(45, 100%, 50%)" color="hsl(45, 100%, 50%)" />)}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>4.8/5 TRUSTPILOT</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        
        {/* Hero Section */}
        <section style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '60px',
          padding: isMobile ? '40px 0' : '80px 0',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'hsla(var(--primary), 0.1)', borderRadius: '12px', color: 'hsl(var(--primary))', fontSize: '0.85rem', fontWeight: 800, marginBottom: '24px' }}>
              <Gift size={16} /> FREE $10.00 WELCOME CASE FOR NEW USERS
            </div>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
              fontWeight: 950, 
              lineHeight: 1, 
              marginBottom: '24px',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '-0.03em'
            }}>
              GET PAID FOR <br />
              <span className="text-gradient">PLAYING GAMES.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'hsl(var(--text-muted))', lineHeight: 1.6, marginBottom: '40px', maxWidth: '540px' }}>
              Join the #1 provably fair gaming platform. Earn coins by playing your favorite games and cash out instantly via PayPal, Crypto or Gift Cards.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
                <button 
                  onClick={startOnboarding}
                  className="btn btn-primary" 
                  style={{ height: '64px', padding: '0 40px', fontSize: '1.2rem', borderRadius: '16px', fontWeight: 800 }}
                >
                  OPEN $10.00 FREE CASE
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px' }}>
                  <div style={{ display: 'flex', marginLeft: '-12px' }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid hsl(var(--bg-color))', background: 'hsl(var(--surface-raised))', marginLeft: '-12px', overflow: 'hidden' }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>
                    <span style={{ color: '#fff' }}>14,204</span> users joined today
                  </span>
                </div>
              </div>
            </div>
          </div>

          {!isMobile && (
            <div style={{ position: 'relative' }}>
              <div className="glass" style={{ 
                borderRadius: '40px', 
                padding: '40px', 
                border: '1px solid hsla(var(--primary), 0.3)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                position: 'relative',
                zIndex: 2,
                background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--bg-color), 0.4))'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>LIVE WITHDRAWALS</h3>
                  <div style={{ padding: '6px 12px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>LIVE FEED</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {liveWithdrawals.slice(0, 4).map((w, i) => (
                    <div key={i} className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'hsla(0,0%,100%,0.03)', borderRadius: '20px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '16px', overflow: 'hidden', background: 'hsla(var(--primary), 0.1)' }}>
                        <img src={w.image} alt="user" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{w.user}</span>
                          <span style={{ fontWeight: 900, color: 'hsl(var(--primary))' }}>${w.amount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{w.currency}</span>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-dim))' }}>{w.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Daily Bonus Ladder */}
        <section style={{ padding: '40px 0' }}>
          <div className="glass" style={{ 
            padding: isMobile ? '24px' : '40px', 
            borderRadius: '40px', 
            border: '1px solid hsla(var(--primary), 0.3)',
            background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--primary), 0.05))',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '24px', right: '40px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>STREAK PROTECTION</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>LOCKED</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} color="hsl(var(--text-dim))" />
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '16px', fontFamily: "'Outfit', sans-serif" }}>
                <TrendingUp size={32} color="hsl(var(--primary))" /> DAILY BONUS LADDER
              </h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1rem', marginTop: '8px' }}>Claim your free daily coins. Reach Day 10 for the <span style={{ color: 'hsl(var(--primary))', fontWeight: 800 }}>Diamond Jackpot</span>.</p>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              gap: '16px', 
              overflowX: 'auto', 
              paddingBottom: '24px',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}>
              {ladderSteps.map((s, i) => {
                const isCurrent = i === 0;
                const isCompleted = false;
                const color = s.tier === 'Diamond' ? '#b9f2ff' : s.tier === 'Gold' ? '#ffd700' : s.tier === 'Silver' ? '#c0c0c0' : '#cd7f32';
                
                return (
                  <div key={i} style={{ 
                    minWidth: '120px', 
                    height: '160px', 
                    borderRadius: '24px', 
                    background: isCurrent ? color : isCompleted ? `${color}22` : 'hsla(0,0%,100%,0.02)',
                    border: `2px solid ${isCurrent ? '#fff' : isCompleted ? `${color}44` : 'hsla(0,0%,100%,0.05)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    position: 'relative',
                    boxShadow: isCurrent ? `0 0 30px ${color}44` : 'none',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} className={isCurrent ? "animate-pulse" : ""}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: isCurrent ? 'black' : 'hsl(var(--text-muted))', letterSpacing: '0.1em' }}>DAY {s.day}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 950, color: isCurrent ? 'black' : '#fff' }}>${s.amount.toFixed(2)}</div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: isCurrent ? 'rgba(0,0,0,0.5)' : color, textTransform: 'uppercase' }}>{s.tier}</div>
                    
                    {isCurrent && <div style={{ position: 'absolute', bottom: '-12px', background: '#fff', color: 'black', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 950, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>CLAIMABLE</div>}
                  </div>
                );
              })}
            </div>
            
            <div style={{ 
              marginTop: '32px', 
              padding: '24px', 
              background: 'hsla(0,0%,100%,0.03)', 
              borderRadius: '20px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              border: '1px solid hsla(0,0%,100%,0.05)'
            }}>
              <button 
                onClick={startOnboarding}
                className="btn btn-primary" 
                style={{ padding: '0 48px', height: '60px', borderRadius: '14px', fontWeight: 900, fontSize: '1.1rem' }}
              >
                CLAIM DAY 1 BONUS ($0.10)
              </button>
            </div>
          </div>
        </section>

        {/* How it Works - The Golden Path */}
        <section style={{ padding: '100px 0', borderTop: '1px solid hsla(0,0%,100%,0.05)', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '0.1em' }}>QUICK START GUIDE</div>
            <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>THE GOLDEN PATH</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>From registration to your first payout in record time.</p>
          </div>
          
          <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '32px', position: 'relative', zIndex: 1 }}>
              {[
                { 
                  step: 1, 
                  title: 'REGISTER', 
                  desc: 'One-click signup with Google, Apple or Discord. Ready in seconds.', 
                  icon: MousePointerClick,
                  time: '15 SEC',
                  proof: '14,204 Nutzer heute beigetreten'
                },
                { 
                  step: 2, 
                  title: 'PLAY & EARN', 
                  desc: 'Play provably fair games. Every round earns you valuable coins.', 
                  icon: Gamepad2,
                  time: '2 MIN',
                  proof: 'Über 1.2 Mio. Quests diese Woche'
                },
                { 
                  step: 3, 
                  title: 'INSTANT CASH', 
                  desc: 'Withdraw your winnings to PayPal or Crypto. No wait time.', 
                  icon: Wallet,
                  time: 'INSTANT',
                  proof: `Auszahlung vor ${lastPayoutTime}s ($45.00 via PayPal)`
                }
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="glass group hover:scale-105 transition-all duration-500" style={{ 
                    padding: '48px 32px', 
                    borderRadius: '40px', 
                    textAlign: 'center', 
                    position: 'relative',
                    border: '1px solid hsla(0,0%,100%,0.05)',
                    background: 'linear-gradient(180deg, hsla(0,0%,100%,0.03) 0%, transparent 100%)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    {!isMobile && i < 2 && (
                      <div style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: 'hsla(var(--primary), 0.3)' }}>
                        <ChevronRight size={32} />
                      </div>
                    )}

                    <div style={{ 
                      position: 'absolute', 
                      top: '24px', 
                      right: '24px', 
                      padding: '6px 12px', 
                      background: 'hsla(var(--success), 0.1)', 
                      color: 'hsl(var(--success))', 
                      borderRadius: '10px', 
                      fontSize: '0.65rem', 
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid hsla(var(--success), 0.2)'
                    }}>
                      <Clock size={12} /> {s.time}
                    </div>

                    <div style={{ 
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '32px', 
                      background: 'linear-gradient(135deg, hsla(var(--primary), 0.2), hsla(var(--primary), 0.05))', 
                      color: 'hsl(var(--primary))', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 32px',
                      boxShadow: '0 20px 40px hsla(var(--primary), 0.1)',
                      position: 'relative',
                      border: '1px solid hsla(var(--primary), 0.2)'
                    }}>
                      <Icon size={48} />
                      
                      {s.step === 2 && (
                        <div className="coin-float-container">
                          {[1, 2, 3, 4, 5].map(j => (
                            <div key={j} className={`coin-particle coin-${j}`}>
                              <CircleDollarSign size={20} fill="hsl(var(--primary))" color="black" />
                            </div>
                          ))}
                        </div>
                      )}

                      {s.step === 3 && (
                        <div className="payment-fan-container">
                          {[
                            { color: '#0070ba', label: 'P' },
                            { color: '#f7931a', label: 'B' },
                            { color: '#ff9900', label: 'A' }
                          ].map((p, j) => (
                            <div key={j} className={`payment-card fan-${j}`} style={{ background: p.color }}>
                              {p.label}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ 
                        position: 'absolute', 
                        bottom: '-12px', 
                        right: '-12px', 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '14px', 
                        background: 'hsl(var(--primary))', 
                        color: 'black', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 950, 
                        fontSize: '1.2rem',
                        border: '4px solid hsl(var(--bg-color))',
                        zIndex: 10,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                      }}>
                        {s.step}
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em', color: '#fff' }}>{s.title}</h4>
                    <p style={{ color: 'hsl(var(--text-muted))', lineHeight: 1.6, fontSize: '1rem', marginBottom: '28px', minHeight: '4.8em' }}>{s.desc}</p>
                    
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 800, 
                      color: 'hsl(var(--primary))', 
                      padding: '10px 20px', 
                      background: 'hsla(var(--primary), 0.08)', 
                      borderRadius: '14px', 
                      display: 'inline-block',
                      border: '1px solid hsla(var(--primary), 0.15)'
                    }}>
                      {s.proof}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <style>{`
            .coin-float-container, .payment-fan-container {
              position: absolute;
              inset: 0;
              pointer-events: none;
              opacity: 0;
              transition: opacity 0.3s;
              z-index: 5;
            }

            .glass.group:hover .coin-float-container,
            .glass.group:hover .payment-fan-container {
              opacity: 1;
            }

            .coin-particle {
              position: absolute;
              left: 50%;
              top: 50%;
            }
            @keyframes floatCoin {
              0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 0; }
            }
            .coin-1 { --tx: -50px; --ty: -40px; animation: floatCoin 1.5s infinite 0.1s; }
            .coin-2 { --tx: 50px; --ty: -30px; animation: floatCoin 1.5s infinite 0.3s; }
            .coin-3 { --tx: -30px; --ty: -60px; animation: floatCoin 1.5s infinite 0.5s; }
            .coin-4 { --tx: 40px; --ty: -50px; animation: floatCoin 1.5s infinite 0.7s; }
            .coin-5 { --tx: 0px; --ty: -70px; animation: floatCoin 1.5s infinite 0.9s; }

            .payment-card {
              position: absolute;
              width: 32px;
              height: 40px;
              border-radius: 6px;
              top: 50%;
              left: 50%;
              display: flex;
              alignItems: center;
              justifyContent: center;
              font-weight: 900;
              font-size: 14px;
              color: white;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              transform-origin: bottom center;
              transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              margin-left: -16px;
              margin-top: -45px;
            }
            .glass.group:hover .fan-0 { transform: rotate(-25deg) translate(-30px, -10px); }
            .glass.group:hover .fan-1 { transform: rotate(0deg) translate(0, -20px); }
            .glass.group:hover .fan-2 { transform: rotate(25deg) translate(30px, -10px); }
          `}</style>
        </section>

        {/* Featured Offers Section */}
        <section style={{ padding: '80px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px' }}>FEATURED OFFERS</h2>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.1rem' }}>Complete tasks in our games to earn massive rewards.</p>
            </div>
            <Link href="/games" className="btn btn-secondary" style={{ borderRadius: '12px', gap: '8px' }}>
              VIEW ALL OFFERS <ChevronRight size={18} />
            </Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
            {featuredGames.map(game => (
              <Link key={game.id} href={game.path} className="glass-card" style={{ 
                padding: '0', 
                borderRadius: '32px', 
                overflow: 'hidden', 
                textDecoration: 'none', 
                color: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid hsla(0,0%,100%,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ height: '180px', position: 'relative' }}>
                  <Image src={game.image} alt={game.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, hsla(var(--bg-color), 1) 0%, transparent 80%)' }} />
                  
                  <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '6px 12px', background: 'hsl(var(--primary))', color: 'black', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>
                    {game.tag}
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '4px' }}>{game.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>
                        <Trophy size={14} /> {game.task}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 950, color: 'hsl(var(--primary))' }}>{game.reward}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>REWARD</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-dim))', textTransform: 'uppercase', marginBottom: '4px' }}>DIFFICULTY</div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3].map(i => (
                          <div key={i} style={{ 
                            width: '20px', 
                            height: '4px', 
                            borderRadius: '2px', 
                            background: i <= (game.difficulty === 'Beginner' ? 1 : game.difficulty === 'Medium' ? 2 : 3) ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.1)' 
                          }} />
                        ))}
                      </div>
                    </div>
                    <div className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '12px' }}>
                      EARN NOW
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '8px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid hsla(0,0%,100%,0.05)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['PayPal', 'BTC', 'Visa'].map(m => (
                        <div key={m} style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>{m}</div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={10} color="hsl(var(--success))" />
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--success))' }}>INSTANT</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Hall of Fame - Big Win Showcase */}
        <section style={{ padding: '80px 0', borderTop: '1px solid hsla(0,0%,100%,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '0.1em' }}>SOCIAL PROOF</div>
            <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>HALL OF FAME</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Witness the biggest wins from our community members this week.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            {[
              { user: 'MaxWin_88', game: 'CRASH', mult: '1,250x', amount: '$5,200', date: '2h ago', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', color: 'hsl(var(--primary))' },
              { user: 'LuckyLady', game: 'SLOTS', mult: 'MEGA', amount: '$12,450', date: '5h ago', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lady', color: 'hsl(var(--secondary))' },
              { user: 'CryptoKing', game: 'DICE', mult: '9,900x', amount: '$2,100', date: '12h ago', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=King', color: 'hsl(var(--accent))' },
              { user: 'NeonSniper', game: 'CRASH', mult: '420x', amount: '$1,800', date: '1d ago', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neon', color: 'hsl(var(--primary))' },
            ].map((win, i) => (
              <div key={i} className="glass-card hover:scale-105 transition-all duration-300" style={{ 
                padding: '32px', 
                borderRadius: '32px', 
                border: '1px solid hsla(0,0%,100%,0.05)',
                background: 'linear-gradient(180deg, hsla(0,0%,100%,0.03) 0%, transparent 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', background: win.color, filter: 'blur(60px)', opacity: 0.1 }} />
                
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${win.color}`, padding: '4px', margin: '0 auto 20px', background: 'hsla(0,0%,0%,0.2)' }}>
                  <img src={win.img} alt={win.user} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                </div>
                
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '4px' }}>{win.user}</h4>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: win.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>{win.game} MASTER</div>
                
                <div style={{ padding: '16px', background: 'hsla(0,0%,0%,0.2)', borderRadius: '20px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-dim))', marginBottom: '4px' }}>WIN MULTIPLIER</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 950, color: '#fff' }}>{win.mult}</div>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-dim))', marginBottom: '4px' }}>PAYOUT</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'hsl(var(--success))' }}>{win.amount}</div>
                </div>

                <div style={{ marginTop: '20px', fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--text-dim))' }}>{win.date}</div>
              </div>
            ))}
          </div>
        </section>

        {/* VIP Club Roadmap */}
        <section style={{ padding: '100px 0', borderTop: '1px solid hsla(0,0%,100%,0.05)', background: 'linear-gradient(180deg, transparent, hsla(var(--primary), 0.02))' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '0.1em' }}>LOYALTY PROGRAM</div>
            <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>VIP CLUB ROADMAP</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Level up your account to unlock permanent perks and higher earnings.</p>
          </div>

          <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
            {!isMobile && (
              <div style={{ position: 'absolute', top: '120px', left: '5%', right: '5%', height: '4px', background: 'linear-gradient(90deg, #cd7f32, #c0c0c0, #ffd700, #b9f2ff)', borderRadius: '2px', opacity: 0.2 }} />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { name: 'BRONZE', level: 'Level 1', perks: ['Daily Missions', '1% Rakeback'], color: '#cd7f32', icon: '🥉' },
                { name: 'SILVER', level: 'Level 10', perks: ['Weekly Bonus', '5% Rakeback'], color: '#c0c0c0', icon: '🥈' },
                { name: 'GOLD', level: 'Level 25', perks: ['VIP Manager', '10% Rakeback'], color: '#ffd700', icon: '🥇' },
                { name: 'DIAMOND', level: 'Level 100', perks: ['Instant Cashout', '20% Rakeback'], color: '#b9f2ff', icon: '💎' },
              ].map((tier, i) => (
                <div key={i} className="glass-card" style={{ 
                  padding: '32px', 
                  borderRadius: '32px', 
                  textAlign: 'center',
                  border: `1px solid ${tier.color}33`,
                  position: 'relative',
                  background: 'hsla(0,0%,0%,0.3)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{tier.icon}</div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: tier.color, marginBottom: '8px' }}>{tier.name}</h4>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'hsl(var(--text-dim))', marginBottom: '24px' }}>START AT {tier.level}</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    {tier.perks.map((perk, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                        <CheckCircle2 size={16} color="hsl(var(--success))" /> {perk}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Security Deep-Dive */}
        <section style={{ padding: '100px 0', borderTop: '1px solid hsla(0,0%,100%,0.05)', background: 'hsla(var(--primary), 0.02)' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '0.1em' }}>SECURITY FIRST</div>
            <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>SAFE. FAIR. TRANSPARENT.</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>We use industry-leading technology to ensure your funds and games are 100% secure.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Provably Fair Card with Graphic */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '32px', border: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid hsla(var(--primary), 0.2)' }}>
                <ShieldCheck size={40} />
              </div>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px' }}>PROVABLY FAIR</h4>
              
              {/* Provably Fair Graphic */}
              <div style={{ margin: '0 auto 24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>
                  <div style={{ padding: '4px 8px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '4px' }}>CLIENT SEED</div>
                  <span>+</span>
                  <div style={{ padding: '4px 8px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '4px' }}>SERVER SEED</div>
                </div>
                <div style={{ margin: '8px 0', color: 'hsl(var(--primary))' }}><ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} /></div>
                <div style={{ padding: '8px', background: 'hsla(var(--primary), 0.1)', borderRadius: '8px', border: '1px solid hsla(var(--primary), 0.2)', color: 'white', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  SHA-256 HASH RESULT
                </div>
              </div>

              <p style={{ color: 'hsl(var(--text-muted))', lineHeight: 1.6, fontSize: '0.95rem' }}>Every game outcome is cryptographically verifiable. We guarantee that neither we nor the players can manipulate the results.</p>
            </div>

            {/* Instant Payout Card */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '32px', border: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid hsla(var(--success), 0.2)' }}>
                <Zap size={40} />
              </div>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px' }}>INSTANT PAYOUTS</h4>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <div style={{ padding: '8px 12px', background: '#0070ba', borderRadius: '8px', fontSize: '0.7rem', color: 'white', fontWeight: 900 }}>PayPal</div>
                <div style={{ padding: '8px 12px', background: '#f7931a', borderRadius: '8px', fontSize: '0.7rem', color: 'white', fontWeight: 900 }}>BTC</div>
              </div>
              <p style={{ color: 'hsl(var(--text-muted))', lineHeight: 1.6, fontSize: '0.95rem' }}>Our automated withdrawal system processes your winnings in real-time. No manual approvals, no long waiting times.</p>
            </div>

            {/* SSL Encryption Card */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '32px', border: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'hsla(210, 100%, 50%, 0.1)', color: '#2196f3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid hsla(210, 100%, 50%, 0.2)' }}>
                <Lock size={40} />
              </div>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px' }}>SSL ENCRYPTION</h4>
              <div style={{ margin: '0 auto 24px', height: '40px', width: '100px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #2196f333' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2196f3', marginRight: '8px' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#2196f3' }}>AES-256</span>
              </div>
              <p style={{ color: 'hsl(var(--text-muted))', lineHeight: 1.6, fontSize: '0.95rem' }}>Your data is protected by bank-grade 256-bit SSL encryption. All transactions and personal information are strictly secure.</p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section style={{ 
          padding: isMobile ? '60px 24px' : '100px 60px', 
          background: 'linear-gradient(135deg, hsla(var(--primary), 0.2), hsla(var(--secondary), 0.2))',
          borderRadius: '40px',
          textAlign: 'center',
          border: '1px solid hsla(var(--primary), 0.3)',
          marginBottom: '100px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '32px', position: 'relative', display: 'inline-block' }}>
              <div className="case-bounce" style={{ position: 'relative', zIndex: 2 }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" fill="hsl(var(--primary))" />
                  <path d="M22 9L12 14L2 9" stroke="black" strokeWidth="1.5" />
                  <path d="M12 12V21" stroke="black" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" fill="white" stroke="black" strokeWidth="1" />
                  <path d="M11 12H13M12 11V13" stroke="black" strokeWidth="1" />
                </svg>
                <div className="payout-particles">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className={`payout-coin p-coin-${i}`}>
                      <CircleDollarSign size={14} fill="gold" color="orange" />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'absolute', top: '-10px', right: '-20px', background: '#fff', color: 'black', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 950, boxShadow: '0 10px 20px rgba(0,0,0,0.3)', transform: 'rotate(15deg)', zIndex: 3, border: '2px solid hsl(var(--primary))' }}>
                $10.00 FREE
              </div>
            </div>

            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 950, marginBottom: '24px' }}>READY TO START EARNING?</h2>
            <p style={{ fontSize: '1.2rem', color: '#fff', opacity: 0.9, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Join over 2 million players who already earned $300,000,000+ playing on Casino Royale.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
              <button 
                onClick={startOnboarding}
                className="btn btn-primary" 
                style={{ height: '64px', padding: '0 40px', fontSize: '1.2rem', borderRadius: '16px', fontWeight: 950, boxShadow: '0 20px 40px hsla(var(--primary), 0.3)' }}
              >
                OPEN $10.00 FREE CASE
              </button>
              
              {!isMobile && <span style={{ color: 'hsl(var(--text-dim))', fontWeight: 800, fontSize: '0.8rem' }}>OR SIGN UP WITH</span>}
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={startOnboarding} className="btn btn-secondary" style={{ width: '64px', height: '64px', borderRadius: '16px', padding: 0, background: '#fff', border: 'none' }}>
                  <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" style={{ width: '24px', height: '24px' }} />
                </button>
                <button onClick={startOnboarding} className="btn btn-secondary" style={{ width: '64px', height: '64px', borderRadius: '16px', padding: 0, background: '#5865F2', border: 'none' }}>
                  <div style={{ color: 'white' }}><Users size={24} /></div>
                </button>
                <button onClick={startOnboarding} className="btn btn-secondary" style={{ width: '64px', height: '64px', borderRadius: '16px', padding: 0, background: '#171a21', border: 'none' }}>
                  <div style={{ color: 'white' }}><Gamepad2 size={24} /></div>
                </button>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ color: 'hsl(var(--success))', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> No ID Verification Required
              </div>
              <div style={{ color: 'hsl(var(--success))', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Average Payout Time: 2m
              </div>
            </div>

            <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '24px' : '40px', flexWrap: 'wrap', opacity: 0.6 }}>
              {[
                { name: 'PayPal', color: '#0070ba', label: 'P' },
                { name: 'Bitcoin', color: '#f7931a', label: 'B' },
                { name: 'Visa', color: '#1a1f71', label: 'V' },
                { name: 'Amazon', color: '#ff9900', label: 'A' },
                { name: 'Litecoin', color: '#345d9d', label: 'L' },
              ].map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '14px' }}>{p.label}</div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.05em', color: '#fff' }}>{p.name.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            .coin-float-container, .payment-fan-container {
              position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 5;
            }
            .glass.group:hover .coin-float-container, .glass.group:hover .payment-fan-container { opacity: 1; }
            .coin-particle { position: absolute; left: 50%; top: 50%; }
            @keyframes floatCoin {
              0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 0; }
            }
            .coin-1 { --tx: -50px; --ty: -40px; animation: floatCoin 1.5s infinite 0.1s; }
            .coin-2 { --tx: 50px; --ty: -30px; animation: floatCoin 1.5s infinite 0.3s; }
            .coin-3 { --tx: -30px; --ty: -60px; animation: floatCoin 1.5s infinite 0.5s; }
            .coin-4 { --tx: 40px; --ty: -50px; animation: floatCoin 1.5s infinite 0.7s; }
            .coin-5 { --tx: 0px; --ty: -70px; animation: floatCoin 1.5s infinite 0.9s; }

            .payment-card {
              position: absolute; width: 32px; height: 40px; border-radius: 6px; top: 50%; left: 50%; display: flex; alignItems: center; justifyContent: center; font-weight: 900; font-size: 14px; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform-origin: bottom center; transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); margin-left: -16px; margin-top: -45px;
            }
            .glass.group:hover .fan-0 { transform: rotate(-25deg) translate(-30px, -10px); }
            .glass.group:hover .fan-1 { transform: rotate(0deg) translate(0, -20px); }
            .glass.group:hover .fan-2 { transform: rotate(25deg) translate(30px, -10px); }

            @keyframes caseBounce {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-10px) rotate(2deg); }
            }
            .case-bounce { animation: caseBounce 3s ease-in-out infinite; }
            .payout-particles { position: absolute; inset: 0; z-index: 1; }
            .payout-coin { position: absolute; left: 50%; top: 40%; opacity: 0; }
            @keyframes sprayCoin {
              0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translate(calc(-50% + var(--sx)), calc(-50% + var(--sy))) scale(1) rotate(var(--sr)); opacity: 0; }
            }
            .p-coin-1 { --sx: -40px; --sy: -60px; --sr: 45deg; animation: sprayCoin 2s infinite 0.1s; }
            .p-coin-2 { --sx: 40px; --sy: -70px; --sr: -30deg; animation: sprayCoin 2s infinite 0.4s; }
            .p-coin-3 { --sx: -20px; --sy: -90px; --sr: 15deg; animation: sprayCoin 2s infinite 0.7s; }
            .p-coin-4 { --sx: 30px; --sy: -40px; --sr: 90deg; animation: sprayCoin 2s infinite 1.0s; }
            .p-coin-5 { --sx: -60px; --sy: -30px; --sr: -60deg; animation: sprayCoin 2s infinite 1.3s; }
            .p-coin-6 { --sx: 10px; --sy: -100px; --sr: 120deg; animation: sprayCoin 2s infinite 1.6s; }
          `}</style>
        </section>

      </div>
    </div>
  );
}
