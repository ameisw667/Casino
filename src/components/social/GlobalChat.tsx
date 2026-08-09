'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import { ChatBotService } from '@/lib/casino/chat-bot';
import { PlayerProfileModal } from './PlayerProfileModal';
import Image from 'next/image';

export function GlobalChat() {
  const isChatOpen = useCasinoStore((state) => state.isChatOpen);
  const setIsChatOpen = useCasinoStore((state) => state.setIsChatOpen);
  const isMobile = useCasinoStore((state) => state.isMobile);
  const chatMessages = useCasinoStore((state) => state.chatMessages);
  const addChatMessage = useCasinoStore((state) => state.addChatMessage);
  const anonymousBetting = useCasinoStore((state) => state.anonymousBetting);

  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ChatBotService.start();
    return () => ChatBotService.stop();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  const handleSend = () => {
    if (!message.trim()) return;

    const isCommand = message.startsWith('/');
    const user = 'You';
    if (isCommand) {
      const handled = ChatBotService.handleCommand(user, message);
      if (handled) {
        setMessage('');
        return;
      }
    }
    const textToSend = message.trim();
    addChatMessage({
      user,
      rank: 'PLAYER',
      message: textToSend,
    });
    setMessage('');

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: textToSend }),
    }).catch(() => {});
  };

  if (!isChatOpen && !isMobile) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05, x: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(true)}
        style={{
          position: 'fixed',
          right: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '28px',
          height: '72px',
          background: 'hsla(var(--bg-color), 0.6)',
          border: '1px solid hsla(0,0%,100%,0.06)',
          borderLeft: '1px solid hsla(var(--primary), 0.15)',
          borderTopLeftRadius: '10px',
          borderBottomLeftRadius: '10px',
          borderRight: 'none',
          cursor: 'pointer',
          zIndex: 50,
          backdropFilter: 'blur(8px)',
          color: 'hsla(var(--text-main), 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s ease, border-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'hsl(var(--primary))';
          e.currentTarget.style.borderLeftColor = 'hsla(var(--primary), 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'hsla(var(--text-main), 0.4)';
          e.currentTarget.style.borderLeftColor = 'hsla(var(--primary), 0.15)';
        }}
      >
        <MessageSquare size={14} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={isMobile ? { y: '100%' } : { x: '100%' }}
      animate={isMobile ? { y: isChatOpen ? 0 : '100%' } : { x: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'fixed',
        right: 0,
        top: isMobile ? 'auto' : '32px',
        bottom: isMobile ? 'calc(72px + env(safe-area-inset-bottom))' : 0,
        width: isMobile ? '100%' : '280px',
        height: isMobile ? '50vh' : 'auto',
        background: 'hsla(var(--bg-color), 0.85)',
        backdropFilter: 'blur(16px)',
        borderLeft: isMobile ? 'none' : '1px solid hsla(0,0%,100%,0.04)',
        borderTop: isMobile ? '1px solid var(--glass-border)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 45,
        boxShadow: '-4px 0 16px rgba(0,0,0,0.2)',
        color: 'hsl(var(--text-main))',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={18} className="text-primary" />
          <h3 style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '1px' }}>LIVE CHAT</h3>
          <div
            style={{
              padding: '2px 8px',
              background: 'rgba(0,255,0,0.1)',
              color: '#00e701',
              borderRadius: '10px',
              fontSize: '0.65rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e701' }}
            />
            1,284
          </div>
        </div>
        <button
          onClick={() => setIsChatOpen(false)}
          style={{ background: 'transparent', border: 'none', color: '#b1bad3', cursor: 'pointer' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        }}
      >
        <AnimatePresence mode="popLayout">
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  opacity: msg.user === 'You' && anonymousBetting ? 0.8 : 1,
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}
                >
                  {msg.isSystem ? (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        position: 'relative',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'hsl(var(--primary))',
                      }}
                    >
                      <Image
                        src="/images/system-bot-3d.png"
                        alt="ROY"
                        fill
                        sizes="50px"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background:
                          msg.rank === 'MOD'
                            ? 'rgba(255, 0, 0, 0.1)'
                            : msg.rank === 'VIP'
                              ? 'rgba(255, 215, 0, 0.1)'
                              : 'rgba(255,255,255,0.05)',
                        color:
                          msg.rank === 'MOD'
                            ? '#ff4d4d'
                            : msg.rank === 'VIP'
                              ? '#ffd700'
                              : '#b1bad3',
                      }}
                    >
                      {msg.rank}
                    </span>
                  )}
                  <span
                    onClick={() => setSelectedUser(msg.user)}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 950,
                      color:
                        msg.user === 'You'
                          ? 'hsl(var(--primary))'
                          : msg.isSystem
                            ? 'hsl(var(--primary))'
                            : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {msg.user}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#556773', marginLeft: 'auto' }}>
                    {msg.time}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: msg.isSystem ? 'hsl(var(--primary))' : '#b1bad3',
                    lineHeight: '1.4',
                    padding: msg.isWin ? '8px' : '0',
                    background: msg.isWin ? 'rgba(0,231,1,0.05)' : 'transparent',
                    borderRadius: '8px',
                    border: msg.isWin ? '1px solid rgba(0,231,1,0.1)' : 'none',
                    fontWeight: msg.isWin ? 700 : 400,
                  }}
                >
                  {msg.message}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '16px',
          background: 'hsla(var(--bg-color), 0.5)',
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: 'hsla(0,0%,100%,0.03)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            style={{
              background: 'hsl(var(--primary))',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
      <PlayerProfileModal
        user={selectedUser || ''}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </motion.div>
  );
}
