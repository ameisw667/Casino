'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Wallet, Zap, Rocket, Dice6, RotateCcw, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCasinoStore } from '@/store/useCasinoStore';
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const soundEnabled = useCasinoStore(s => s.soundEnabled);
  const toggleSound = useCasinoStore(s => s.toggleSound);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const commands = [
    { id: 'crash', title: 'Play Crash', icon: <Rocket size={18} />, category: 'Games', action: () => router.push('/games/crash') },
    { id: 'dice', title: 'Play Dice', icon: <Dice6 size={18} />, category: 'Games', action: () => router.push('/games/dice') },
    { id: 'roulette', title: 'Play Roulette', icon: <RotateCcw size={18} />, category: 'Games', action: () => router.push('/games/roulette') },
    { id: 'slots', title: 'Play Slots', icon: <LayoutGrid size={18} />, category: 'Games', action: () => router.push('/games/slots') },
    { id: 'profile', title: 'View Profile', icon: <User size={18} />, category: 'Account', action: () => router.push('/profile') },
    { id: 'wallet', title: 'Open Wallet', icon: <Wallet size={18} />, category: 'Account', action: () => {} },
    { id: 'sound', title: `Toggle Sound (${soundEnabled ? 'ON' : 'OFF'})`, icon: <Zap size={18} />, category: 'Settings', action: toggleSound },
  ].filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()));
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          style={{
            width: '90%', maxWidth: '600px', background: '#1a2c38',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
            zIndex: 5001, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
          }}
        >
          {/* Search Input */}
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Search size={20} style={{ color: '#556b82' }} />
            <input 
              autoFocus
              placeholder="Search games, pages, settings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', color: '#fff',
                fontSize: '1rem', outline: 'none', fontWeight: 700
              }}
            />
            <div style={{ fontSize: '0.65rem', fontWeight: 900, padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#556b82' }}>
              ESC
            </div>
          </div>
          {/* Results Area */}
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px' }}>
            {commands.length > 0 ? (
              <div>
                {Array.from(new Set(commands.map(c => c.category))).map(category => (
                  <div key={category} style={{ marginBottom: '16px' }}>
                    <div style={{ padding: '8px 12px', fontSize: '0.65rem', fontWeight: 950, color: '#556b82', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {category}
                    </div>
                    {commands.filter(c => c.category === category).map(cmd => (
                      <motion.button
                        key={cmd.id}
                        whileHover={{ background: 'rgba(255,255,255,0.03)', x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { cmd.action(); setIsOpen(false); }}
                        style={{
                          width: '100%', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                          background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer',
                          textAlign: 'left', color: '#b1bad3'
                        }}
                      >
                        <div style={{ color: 'hsl(var(--primary))' }}>{cmd.icon}</div>
                        <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{cmd.title}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#556b82' }}>↵</div>
                      </motion.button>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#556b82', fontSize: '0.9rem' }}>
                No results found for &quot;{query}&quot;
              </div>
            )}
          </div>
          {/* Footer */}
          <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#556b82', fontWeight: 800 }}>
              <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>↑↓</span> Navigate
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#556b82', fontWeight: 800 }}>
              <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>↵</span> Select
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}