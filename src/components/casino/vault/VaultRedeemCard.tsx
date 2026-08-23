'use client';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { card } from './vault-card';

interface VaultRedeemCardProps {
  redeemInputRef: RefObject<HTMLInputElement | null>;
  voucherCode: string;
  onVoucherCodeChange: Dispatch<SetStateAction<string>>;
  isRedeeming: boolean;
  onRedeem: () => void;
}

export function VaultRedeemCard({
  redeemInputRef,
  voucherCode,
  onVoucherCodeChange,
  isRedeeming,
  onRedeem,
}: VaultRedeemCardProps) {
  return (
    <div style={{ ...card({ padding: '24px 20px' }) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Gift size={14} color="#D4AF37" />
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>REDEEM CODE</span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          ref={redeemInputRef}
          type="text"
          value={voucherCode}
          onChange={(e) => onVoucherCodeChange(e.target.value)}
          placeholder="e.g. JAN100"
          style={{
            flex: 1,
            height: 42,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            padding: '0 14px',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 600,
            outline: 'none',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRedeem}
          disabled={isRedeeming || !voucherCode.trim()}
          style={{
            padding: '0 18px',
            height: 42,
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 900,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #D4AF37, #b8962e)',
            color: '#000',
          }}
        >
          {isRedeeming ? '...' : 'GO'}
        </motion.button>
      </div>
    </div>
  );
}
