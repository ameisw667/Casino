'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check, X } from 'lucide-react';

interface InsuranceModalProps {
  isOpen: boolean;
  isEvenMoney: boolean;
  insuranceCost: number;
  onAccept: () => void;
  onDecline: () => void;
}

export default function InsuranceModal({
  isOpen,
  isEvenMoney,
  insuranceCost,
  onAccept,
  onDecline,
}: InsuranceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.35 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            width: '90%',
            maxWidth: '420px',
            background: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '2px solid #FFD700',
            borderRadius: '20px',
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.4), 0 20px 50px rgba(0, 0, 0, 0.9)',
            padding: '20px',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Icon */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <ShieldAlert size={22} color="#FFD700" />
          </div>

          {/* Title */}
          <h3
            style={{
              margin: '0 0 6px 0',
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#FFF',
              letterSpacing: '1px',
            }}
          >
            {isEvenMoney ? 'TAKE EVEN MONEY?' : 'BUY INSURANCE?'}
          </h3>

          {/* Description */}
          <p
            style={{
              margin: '0 0 16px 0',
              fontSize: '0.78rem',
              color: '#94a3b8',
              lineHeight: 1.45,
            }}
          >
            {isEvenMoney
              ? 'Dealer shows an Ace. You can lock in a guaranteed 1:1 payout now, or decline for the chance at a 3:2 win.'
              : `Dealer shows an Ace. Protect your hand against a Dealer Blackjack for $${insuranceCost.toFixed(2)} (pays 2:1).`}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={onAccept}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
                border: 'none',
                color: '#000',
                fontWeight: 900,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)',
              }}
            >
              <Check size={16} strokeWidth={3} />
              <span>{isEvenMoney ? 'ACCEPT (1:1)' : `BUY ($${insuranceCost.toFixed(2)})`}</span>
            </button>

            <button
              onClick={onDecline}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <X size={16} strokeWidth={2.5} />
              <span>DECLINE</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
