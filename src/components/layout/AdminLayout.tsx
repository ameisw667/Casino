'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';
import {
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
  Terminal,
  BarChart2,
  FlaskConical,
  LogOut
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useSupabaseSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin' },
    { icon: <Users size={20} />, label: 'User Management', path: '/admin/users' },
    { icon: <BarChart2 size={20} />, label: 'Game Stats', path: '/admin/games' },
    { icon: <FlaskConical size={20} />, label: 'Simulation', path: '/admin/simulation' },
  ];

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: 'var(--font-inter)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: sidebarOpen ? '260px' : '80px', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', position: 'relative' }}>
            <Image src="/images/brand-medallion-3d.png" alt="Logo" fill sizes="100px" style={{ objectFit: 'contain' }} />
          </div>
          {sidebarOpen && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '1px' }}>CASINO <span style={{ color: '#ffd700' }}>ADMIN</span></span>
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>VIBE-OPERATOR v1.0</span>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const active = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: active ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  color: active ? '#ffd700' : 'rgba(255,255,255,0.6)',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center'
                }}
              >
                {item.icon}
                {sidebarOpen && <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            margin: '12px',
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ 
          height: '72px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          background: 'rgba(5, 5, 5, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Terminal size={18} color="#ffd700" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>
              root@casino-royale:~# {pathname.split('/').pop() || 'dashboard'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e701', boxShadow: '0 0 8px #00e701' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#00e701' }}>LIVE SYSTEM</span>
            </div>
            <button
              onClick={() => signOut()}
              aria-label="Abmelden"
              style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(255,215,0,0.3)', background: 'transparent', color: '#ffd700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
