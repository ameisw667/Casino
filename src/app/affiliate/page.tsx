'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  CircleDollarSign, Users, TrendingUp, Copy, Link as LinkIcon, Activity, 
  Share2, Download, BarChart3, Settings, ShieldCheck, Mail, Trophy, 
  Zap, Gift, FileText, CheckCircle2, ChevronRight, MessageSquare, 
  Code, HelpCircle, Star, Crown, X, Send, Phone, ArrowUpRight
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import Link from 'next/link';

export default function AffiliatePage() {
  const { isMobile } = useCasinoStore();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [forecastWager, setForecastWager] = useState(10000);

  // Simulated state for inputs
  const [customLink, setCustomLink] = useState('vibe');
  const [landingPage, setLandingPage] = useState('home');
  const [promoCode, setPromoCode] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoWithdraw, setAutoWithdraw] = useState(true);

  // 1. Multi-Tier Dashboard Data
  const stats = {
    clicks: '12,450',
    signups: '4,204',
    activeRefs: '1,204',
    subRefs: '450', // 16. Sub-Affiliate Support
    totalEarned: '$42,500.00',
    available: '$1,240.50'
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '0 24px 100px' }}>
      
      {/* 25. Monthly Contest Banner */}
      <div style={{ marginTop: '20px', padding: '16px', background: 'linear-gradient(90deg, hsla(var(--primary), 0.2), hsla(var(--accent), 0.2))', borderRadius: '16px', border: '1px solid hsla(var(--primary), 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy color="hsl(var(--primary))" />
          <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>$50,000 MONTHLY AFFILIATE RACE ACTIVE</span>
        </div>
        <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>VIEW LEADERBOARD</button>
      </div>

      <header style={{ 
        position: 'relative', 
        borderRadius: '32px', 
        overflow: 'hidden', 
        padding: isMobile ? '32px 20px' : '48px',
        border: '1px solid hsla(var(--primary), 0.2)',
        background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--primary), 0.05))',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '40px', alignItems: 'flex-start' }}>
          
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'hsla(var(--primary), 0.1)', borderRadius: '8px', color: 'hsl(var(--primary))', fontSize: '0.75rem', fontWeight: 900, marginBottom: '16px' }}>
              <Users size={14} /> PARTNER DASHBOARD
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 950, fontFamily: "'Outfit', sans-serif", lineHeight: 1, marginBottom: '16px' }}>
              BUILD YOUR <br /><span className="text-gradient">EMPIRE.</span>
            </h1>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.1rem', marginBottom: '32px', maxWidth: '500px' }}>
              You are currently a Gold Partner. Earn up to 25% revenue share on every referred player, instantly paid out.
            </p>

            {/* 3. Tiered Commission Bar & 11. Partner Level Icons */}
            <div style={{ background: 'hsla(0,0%,0%,0.2)', padding: '24px', borderRadius: '24px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'hsla(45, 100%, 50%, 0.1)', border: '2px solid hsl(45, 100%, 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🥇</div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'hsl(45, 100%, 50%)' }}>GOLD PARTNER</div>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))', fontWeight: 800 }}>15% REVENUE SHARE</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>NEXT TIER: PLATINUM</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff' }}>20% SHARE</div>
                </div>
              </div>
              <div style={{ height: '8px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, hsl(45, 100%, 50%), #b9f2ff)' }} />
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-dim))', marginTop: '8px', textAlign: 'right' }}>
                $6,500 / $10,000 MONTHLY REVENUE
              </div>
            </div>
          </div>

          {/* 1. Multi-Tier Dashboard Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'TOTAL EARNED', value: stats.totalEarned, color: 'hsl(var(--primary))' },
              { label: 'AVAILABLE TO CLAIM', value: stats.available, color: 'hsl(var(--success))' },
              { label: 'TOTAL CLICKS', value: stats.clicks, color: '#fff' },
              { label: 'ACTIVE REFERRALS', value: stats.activeRefs, color: '#fff' },
            ].map((s, i) => (
              <div key={i} className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 950, color: s.color }}>{s.value}</div>
              </div>
            ))}
            
            <button className="btn btn-primary" style={{ gridColumn: '1 / -1', height: '56px', borderRadius: '16px', fontWeight: 900 }}>
              CLAIM $1,240.50 TO VAULT
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {['OVERVIEW', 'CAMPAIGNS', 'TOOLS & API', 'FAQ & SUPPORT'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '14px 28px', 
              borderRadius: '16px', 
              background: activeTab === tab ? 'white' : 'hsla(0,0%,100%,0.03)',
              color: activeTab === tab ? 'black' : 'white',
              border: 'none',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* 14. Conversion Graph */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}><BarChart3 color="hsl(var(--primary))" /> CONVERSION ANALYTICS</h3>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, padding: '6px 12px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '8px' }}>LAST 7 DAYS</div>
              </div>
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px' }}>
                {/* SVG Graph Simulation */}
                <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <path d="M0,150 L0,80 C50,90 100,20 150,50 C200,80 250,10 300,40 C350,70 400,20 450,10 L500,30 L500,150 Z" fill="hsla(var(--primary), 0.1)" />
                  <path d="M0,80 C50,90 100,20 150,50 C200,80 250,10 300,40 C350,70 400,20 450,10 L500,30" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" />
                  <path d="M0,100 C100,120 200,50 300,80 C400,110 500,60 500,60" fill="none" stroke="hsl(var(--success))" strokeWidth="3" />
                </svg>
              </div>
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800 }}><div style={{ width: '12px', height: '12px', background: 'hsl(var(--primary))', borderRadius: '3px' }} /> CLICKS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800 }}><div style={{ width: '12px', height: '12px', background: 'hsl(var(--success))', borderRadius: '3px' }} /> SIGNUPS</div>
              </div>
            </section>

            {/* 7. Active Referrals List & 16. Sub-Affiliate Support */}
            <section className="glass-card" style={{ padding: '0', borderRadius: '32px', overflow: 'hidden' }}>
              <div style={{ padding: '32px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}><Users color="hsl(var(--accent))" /> ACTIVE REFERRALS</h3>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--success))' }}>+ {stats.subRefs} TIER-2 REFS</div>
              </div>
              <div style={{ overflowX: 'auto', padding: '24px' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: 'hsl(var(--text-dim))', fontSize: '0.7rem', fontWeight: 900 }}>
                      <th style={{ padding: '16px' }}>USER</th>
                      <th style={{ padding: '16px' }}>JOINED</th>
                      <th style={{ padding: '16px' }}>WAGERED</th>
                      <th style={{ padding: '16px' }}>REVENUE GENERATED</th>
                      <th style={{ padding: '16px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { user: 'GamerDude', date: 'Today', wagered: '$4,200', rev: '$63.00', status: 'Online' },
                      { user: 'CryptoMax', date: '2d ago', wagered: '$12,400', rev: '$186.00', status: 'Online' },
                      { user: 'Sarah21', date: '1w ago', wagered: '$800', rev: '$12.00', status: 'Offline' },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid hsla(0,0%,100%,0.05)' }}>
                        <td style={{ padding: '16px', fontWeight: 900 }}>{r.user}</td>
                        <td style={{ padding: '16px', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{r.date}</td>
                        <td style={{ padding: '16px', fontWeight: 800 }}>{r.wagered}</td>
                        <td style={{ padding: '16px', fontWeight: 900, color: 'hsl(var(--success))' }}>{r.rev}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 900, color: r.status === 'Online' ? 'hsl(var(--success))' : 'hsl(var(--text-dim))' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} /> {r.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 4. Live Commission Feed & 17. Granular History */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Activity color="hsl(var(--success))" /> LIVE COMMISSIONS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { game: 'CRASH', user: 'GamerDude', amount: '+$0.45', time: 'Just now' },
                  { game: 'SLOTS', user: 'CryptoMax', amount: '+$1.20', time: '1m ago' },
                  { game: 'DICE', user: 'User_99', amount: '+$0.15', time: '3m ago' },
                  { game: 'ROULETTE', user: 'CryptoMax', amount: '+$4.50', time: '5m ago' },
                ].map((c, i) => (
                  <div key={i} className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '16px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>{c.user} wagered on {c.game}</div>
                      <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', fontWeight: 800, marginTop: '4px' }}>{c.time}</div>
                    </div>
                    <div style={{ fontWeight: 950, color: 'hsl(var(--success))' }}>{c.amount}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 22. Milestone Rewards */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px', border: '1px solid hsla(var(--primary), 0.3)', background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--primary), 0.05))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}><Gift color="hsl(var(--primary))" /> NEXT MILESTONE</h3>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '3rem', fontWeight: 950, color: 'hsl(var(--primary))', lineHeight: 1 }}>$500</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-muted))', marginTop: '8px' }}>BONUS REWARD</div>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>{stats.activeRefs} USERS</span>
                <span>2,000 REFS NEEDED</span>
              </div>
              <div style={{ height: '8px', background: 'hsla(0,0%,100%,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'hsl(var(--primary))', boxShadow: '0 0 10px hsla(var(--primary), 0.5)' }} />
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAMPAIGNS */}
      {activeTab === 'CAMPAIGNS' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* 2. Custom Link Generator & 20. Landing Page Testing */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><LinkIcon color="hsl(var(--primary))" /> CUSTOM LINK GENERATOR</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '8px', display: 'block' }}>CUSTOM CODE</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: '0 16px', background: 'hsla(0,0%,100%,0.05)', height: '56px', display: 'flex', alignItems: 'center', borderRadius: '16px 0 0 16px', border: '1px solid hsla(0,0%,100%,0.1)', borderRight: 'none', color: 'hsl(var(--text-muted))' }}>casinoroyale.com/r/</div>
                    <input className="input" value={customLink} onChange={(e) => setCustomLink(e.target.value)} style={{ borderRadius: '0 16px 16px 0', height: '56px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '8px', display: 'block' }}>LANDING PAGE ROUTING</label>
                  <select className="input" value={landingPage} onChange={(e) => setLandingPage(e.target.value)} style={{ height: '56px', width: '100%', appearance: 'none' }}>
                    <option value="home">Main Homepage</option>
                    <option value="crash">Crash Game (High Conversion)</option>
                    <option value="slots">Slots Catalog</option>
                  </select>
                </div>
                
                {/* 12. Social Quick-Share */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button className="btn btn-primary" style={{ flex: 1, height: '56px', borderRadius: '16px', fontWeight: 900 }}><Copy size={18} /> COPY LINK</button>
                  <button className="btn btn-secondary" style={{ width: '56px', height: '56px', padding: 0, borderRadius: '16px', background: '#000', border: 'none', color: 'white' }}><X size={20} /></button>
                  <button className="btn btn-secondary" style={{ width: '56px', height: '56px', padding: 0, borderRadius: '16px', background: '#25D366', border: 'none', color: 'white' }}><Share2 size={20} /></button>
                </div>
              </div>
            </section>

            {/* 13. Custom Promo Codes */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Gift color="hsl(var(--accent))" /> CREATE PROMO CODE</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>Generate a unique code to give your community a $5.00 sign-up bonus. Cost: Deducted from your affiliate earnings.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input className="input" placeholder="e.g. VIBE50" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} style={{ flex: 1, height: '56px', textTransform: 'uppercase' }} />
                <button className="btn btn-secondary" style={{ height: '56px', padding: '0 24px', borderRadius: '16px', fontWeight: 900 }}>GENERATE</button>
              </div>
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 6. Campaign Tracking */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><BarChart3 color="hsl(var(--success))" /> CAMPAIGN TRACKING</h3>
              <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '24px', height: '48px', borderRadius: '12px', borderStyle: 'dashed' }}>+ CREATE NEW CAMPAIGN LINK</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { name: 'YouTube Promo', clicks: '8,402', conversions: '12%', earned: '$24,100' },
                  { name: 'Twitter Bio', clicks: '3,100', conversions: '8%', earned: '$12,400' },
                  { name: 'Twitch Stream', clicks: '948', conversions: '15%', earned: '$6,000' },
                ].map((c, i) => (
                  <div key={i} style={{ padding: '16px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '16px', border: '1px solid hsla(0,0%,100%,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '0.95rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))', fontWeight: 800, marginTop: '4px' }}>{c.clicks} CLICKS • {c.conversions} CONV.</div>
                    </div>
                    <div style={{ fontWeight: 950, color: 'hsl(var(--success))' }}>{c.earned}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. Earning Forecast */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'linear-gradient(135deg, hsla(var(--secondary), 0.1), transparent)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><TrendingUp color="hsl(var(--secondary))" /> EARNING FORECAST</h3>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '12px' }}>
                  <span>EXPECTED MONTHLY WAGER PER USER</span>
                  <span style={{ color: 'hsl(var(--secondary))' }}>${forecastWager.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="100" max="100000" step="100" 
                  value={forecastWager} onChange={(e) => setForecastWager(Number(e.target.value))}
                  style={{ width: '100%', height: '8px', borderRadius: '4px', appearance: 'none', background: 'hsla(var(--secondary), 0.2)' }}
                />
              </div>
              <div style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', textAlign: 'center', border: '1px solid hsla(var(--secondary), 0.2)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>POTENTIAL MONTHLY EARNINGS (100 REFS)</div>
                <div style={{ fontSize: '3rem', fontWeight: 950, color: '#fff' }}>${(forecastWager * 100 * 0.15 * 0.01).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TOOLS & API */}
      {activeTab === 'TOOLS & API' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* 5. Marketing Toolkit */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Download color="hsl(var(--primary))" /> MARKETING TOOLKIT</h3>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', marginBottom: '24px' }}>Download official logos, high-res banners, and promotional videos to use in your campaigns.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button className="btn btn-secondary" style={{ flexDirection: 'column', height: '100px', gap: '12px', borderRadius: '20px' }}>
                  <Image src="/images/hero-banner-new.png" width={40} height={40} alt="Banners" style={{ borderRadius: '8px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>BANNERS PACK</span>
                </button>
                <button className="btn btn-secondary" style={{ flexDirection: 'column', height: '100px', gap: '12px', borderRadius: '20px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 900 }}>LOGO</div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>BRAND ASSETS</span>
                </button>
              </div>
            </section>

            {/* 18. Official Partner Badge */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><ShieldCheck color="hsl(var(--success))" /> PARTNER BADGE EMBED</h3>
              <div style={{ padding: '24px', background: 'hsla(0,0%,0%,0.3)', borderRadius: '20px', border: '1px dashed hsla(var(--success), 0.3)', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '2px solid hsl(var(--success))', borderRadius: '12px', color: 'hsl(var(--success))', fontWeight: 900 }}>
                  <ShieldCheck size={18} /> OFFICIAL GOLD PARTNER
                </div>
              </div>
              <textarea 
                className="input mono" 
                readOnly 
                value={`<a href="https://casinoroyale.com/r/${customLink}"><img src="https://casinoroyale.com/badges/gold-partner.svg" alt="Official Partner" /></a>`}
                style={{ width: '100%', height: '80px', fontSize: '0.75rem', padding: '12px', borderRadius: '16px' }}
              />
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 21. Professional Webhooks */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Code color="hsl(var(--accent))" /> WEBHOOKS (API)</h3>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>Receive real-time JSON payloads for signups and deposits directly to your server.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input className="input" placeholder="https://your-server.com/webhook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} style={{ height: '56px' }} />
                <button className="btn btn-secondary" style={{ height: '48px', borderRadius: '12px', fontWeight: 900 }}>TEST PAYLOAD</button>
              </div>
            </section>

            {/* 10. Auto-Withdraw Settings */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Settings color="hsl(var(--text-dim))" /> AUTO-WITHDRAW</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '20px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 900 }}>Daily Auto-Transfer</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Move earnings to vault daily at 00:00 UTC.</div>
                </div>
                <button 
                  onClick={() => setAutoWithdraw(!autoWithdraw)}
                  style={{ width: '56px', height: '32px', borderRadius: '16px', background: autoWithdraw ? 'hsl(var(--success))' : 'hsla(0,0%,100%,0.1)', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.3s' }}
                >
                  <div style={{ position: 'absolute', top: '4px', left: autoWithdraw ? '28px' : '4px', width: '24px', height: '24px', borderRadius: '50%', background: 'white', transition: 'left 0.3s' }} />
                </button>
              </div>
            </section>

            {/* 19. Referral Messaging */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Send color="hsl(var(--primary))" /> BROADCAST MESSAGE</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '16px' }}>Send a tip or strategy guide to all your active referrals via in-game inbox.</p>
              <textarea className="input" placeholder="Hey team, check out the new Crash strategy..." style={{ height: '100px', resize: 'none', marginBottom: '16px', padding: '16px', borderRadius: '16px' }} />
              <button className="btn btn-primary" style={{ width: '100%', height: '48px', borderRadius: '12px', fontWeight: 900 }}>SEND BROADCAST</button>
            </section>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FAQ & SUPPORT */}
      {activeTab === 'FAQ & SUPPORT' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* 9. Affiliate Leaderboard */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Trophy color="hsl(var(--primary))" /> TOP PARTNERS THIS MONTH</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { rank: 1, name: 'TrainWrecks', earned: '$145k' },
                  { rank: 2, name: 'XQcow', earned: '$98k' },
                  { rank: 3, name: 'VibeCoder', earned: '$42k' },
                ].map(p => (
                  <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: p.rank === 1 ? 'hsla(var(--primary), 0.1)' : 'hsla(0,0%,100%,0.02)', borderRadius: '16px', border: p.rank === 1 ? '1px solid hsla(var(--primary), 0.3)' : '1px solid transparent' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 950, color: p.rank === 1 ? 'hsl(var(--primary))' : 'hsl(var(--text-dim))' }}>#{p.rank}</div>
                    <div style={{ flex: 1, fontWeight: 900 }}>{p.name}</div>
                    <div style={{ fontWeight: 950, color: 'hsl(var(--success))' }}>{p.earned}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 24. Program Comparison */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><ShieldCheck color="hsl(var(--success))" /> WHY CHOOSE US</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ color: 'hsl(var(--text-dim))' }}>
                    <th style={{ padding: '12px' }}>FEATURE</th>
                    <th style={{ padding: '12px', color: 'hsl(var(--primary))' }}>US</th>
                    <th style={{ padding: '12px' }}>OTHERS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { f: 'Max Rev Share', us: '25%', o: '10%' },
                    { f: 'Payouts', us: 'Instant', o: 'Monthly' },
                    { f: 'Sub-Affiliates', us: 'Yes (Tier 2)', o: 'No' },
                    { f: 'API Access', us: 'Free', o: 'Locked' },
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid hsla(0,0%,100%,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 800 }}>{r.f}</td>
                      <td style={{ padding: '12px', fontWeight: 900, color: 'hsl(var(--success))' }}>{r.us}</td>
                      <td style={{ padding: '12px', color: 'hsl(var(--text-muted))' }}>{r.o}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 23. Affiliate Manager Contact */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'linear-gradient(135deg, hsla(var(--accent), 0.1), transparent)', border: '1px solid hsla(var(--accent), 0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Phone color="hsl(var(--accent))" /> VIP MANAGER</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Manager" alt="manager" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'hsla(0,0%,0%,0.5)' }} />
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Elena R.</div>
                  <div style={{ fontSize: '0.8rem', color: 'hsl(var(--accent))', fontWeight: 800 }}>DEDICATED SUPPORT</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" style={{ flex: 1, borderRadius: '12px', fontWeight: 900 }}>TELEGRAM</button>
                <button className="btn btn-secondary" style={{ flex: 1, borderRadius: '12px', fontWeight: 900 }}>EMAIL</button>
              </div>
            </section>

            {/* 15. Affiliate FAQ */}
            <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><HelpCircle color="hsl(var(--text-dim))" /> PARTNER FAQ</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { q: 'How is revenue share calculated?', a: 'You earn a percentage of the house edge on every bet your referral makes, regardless of whether they win or lose.' },
                  { q: 'When can I withdraw?', a: 'Commissions are credited instantly. You can withdraw to your main vault at any time.' },
                  { q: 'What is Tier 2 (Sub-Affiliate)?', a: 'If a user you refer also invites players, you earn 2% of the revenue generated by their players.' },
                ].map((f, i) => (
                  <div key={i} style={{ padding: '16px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '16px' }}>
                    <div style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '8px', color: 'hsl(var(--primary))' }}>{f.q}</div>
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5 }}>{f.a}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

    </div>
  );
}
