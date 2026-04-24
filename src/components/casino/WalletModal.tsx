'use client';

import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  Info,
  CreditCard,
  CircleDollarSign,
  Zap
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { isMobile, balance, addBalance, removeBalance, addToast } = useCasinoStore();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cryptoAddress = 'bc1qxy2kg26gr06p74z685r8u85v9j697gh626u0nk';

  const handleCopy = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Address copied to clipboard!', 'info');
  };

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    addBalance(val);
    addToast(`Successfully deposited $${val.toLocaleString()}!`, 'success');
    setAmount('');
    onClose();
  };

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    const success = removeBalance(val);
    if (success) {
      addToast(`Withdrawal of $${val.toLocaleString()} initiated!`, 'success');
      setAmount('');
      onClose();
    } else {
      addToast('Insufficient balance!', 'error');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 5000, 
      display: 'flex', 
      alignItems: isMobile ? 'flex-end' : 'center', 
      justifyContent: 'center',
      padding: isMobile ? '0' : '20px'
    }}>
      <div 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} 
      />
      
      <div className="glass animate-slide-up" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        borderRadius: isMobile ? '32px 32px 0 0' : '32px', 
        maxHeight: isMobile ? '90vh' : 'auto',
        overflowY: 'auto', 
        position: 'relative',
        border: '1px solid hsla(0,0%,100%,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ padding: isMobile ? '24px' : '32px', background: 'hsla(0,0%,100%,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '14px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={isMobile ? 20 : 24} />
            </div>
            <div>
              <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>CASHIER</h2>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Manage your assets</div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Balance Display */}
        <div style={{ padding: isMobile ? '16px 24px' : '24px 32px', textAlign: 'center', background: 'hsla(var(--primary), 0.05)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-muted))', letterSpacing: '0.1em', marginBottom: '4px' }}>AVAILABLE BALANCE</div>
          <div className="mono" style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: isMobile ? '12px 24px' : '12px 32px', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('deposit')}
            style={{ 
              flex: 1, 
              height: '52px', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'deposit' ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.05)',
              color: activeTab === 'deposit' ? 'black' : 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowDownLeft size={18} /> DEPOSIT
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            style={{ 
              flex: 1, 
              height: '52px', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'withdraw' ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.05)',
              color: activeTab === 'withdraw' ? 'black' : 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowUpRight size={18} /> WITHDRAW
          </button>
        </div>

        <div style={{ padding: isMobile ? '24px' : '32px' }}>
          {activeTab === 'deposit' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '8px', display: 'block' }}>CRYPTO DEPOSIT ADDRESS</label>
                <div className="glass" style={{ padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid hsla(0,0%,100%,0.1)' }}>
                  <div className="mono" style={{ flex: 1, fontSize: '0.8rem', wordBreak: 'break-all', color: 'hsl(var(--text-main))' }}>
                    {cryptoAddress}
                  </div>
                  <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '8px', width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0 }}>
                    {copied ? <Check size={18} color="hsl(var(--success))" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--glass-border)' }} />

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '12px', display: 'block' }}>QUICK DEPOSIT</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[10, 50, 100].map(val => (
                    <button key={val} onClick={() => setAmount(val.toString())} className="btn btn-secondary" style={{ fontSize: '0.95rem', fontWeight: 800, height: '48px' }}>${val}</button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    placeholder="Enter amount..." 
                    className="input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ height: '56px', paddingLeft: '44px', fontSize: '1.1rem' }}
                  />
                  <CircleDollarSign size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                </div>
                <button onClick={handleDeposit} className="btn btn-primary" style={{ width: '100%', height: '56px', marginTop: '16px', fontSize: '1.1rem', borderRadius: '16px' }}>
                  <Zap size={20} /> CONFIRM DEPOSIT
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '8px', display: 'block' }}>WITHDRAWAL ADDRESS</label>
                <input 
                  placeholder="Enter your BTC address..." 
                  className="input"
                  style={{ height: '56px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '8px', display: 'block' }}>AMOUNT TO WITHDRAW</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ height: '56px', paddingLeft: '44px', fontSize: '1.1rem' }}
                  />
                  <CircleDollarSign size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                  <button 
                    onClick={() => setAmount(balance.toString())}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'hsla(var(--primary), 0.1)', border: 'none', color: 'hsl(var(--primary))', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="glass" style={{ padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid hsla(var(--error), 0.2)' }}>
                <Info size={24} color="hsl(var(--error))" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: 1.4 }}>
                  Withdrawals are processed within 24 hours for security reasons.
                </div>
              </div>

              <button onClick={handleWithdraw} className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '1.1rem', borderRadius: '16px' }}>
                REQUEST WITHDRAWAL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
