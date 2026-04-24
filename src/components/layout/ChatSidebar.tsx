'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Users, MessageCircle } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import PlayerProfileModal from '@/components/casino/PlayerProfileModal';

export default function ChatSidebar() {
  const { chatMessages, addChatMessage, level, rank, answerTrivia, friends, directMessages, sendDirectMessage, isMobile } = useCasinoStore();
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'direct'>('global');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{name: string, level: number, rank: string} | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Check if it's a trivia answer
    const isCorrect = answerTrivia(inputText);
    
    if (!isCorrect) {
      addChatMessage({
        user: 'You',
        text: inputText,
        vipTier: level
      });
    }

    setInputText('');
  };

  const handleSendDirect = () => {
    if (!inputText.trim() || !activeConversation) return;
    sendDirectMessage(activeConversation, inputText);
    setInputText('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      const scroll = () => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      };
      // Initial scroll
      scroll();
      // Small timeout for any dynamic content/images
      const timer = setTimeout(scroll, 50);
      return () => clearTimeout(timer);
    }
  }, [chatMessages, activeTab, activeConversation, directMessages]);

  const EMOTES = ['🔥', '🚀', '🎰', '💎', '🍀', '🐋', '🤑', '📉', '📈', '💀'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: isMobile ? 'hsl(var(--bg-color))' : 'transparent' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', background: 'hsla(0,0%,100%,0.03)', padding: '4px', margin: isMobile ? '8px 8px 0' : '16px 16px 0', borderRadius: '12px' }}>
        <button 
          onClick={() => setActiveTab('global')}
          style={{ 
            flex: 1, 
            padding: isMobile ? '10px' : '8px', 
            borderRadius: '8px', 
            border: 'none', 
            background: activeTab === 'global' ? 'hsla(0,0%,100%,0.07)' : 'transparent',
            color: activeTab === 'global' ? 'white' : 'hsl(var(--text-muted))',
            fontSize: isMobile ? '0.7rem' : '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Users size={14} /> GLOBAL
        </button>
        <button 
          onClick={() => setActiveTab('direct')}
          style={{ 
            flex: 1, 
            padding: isMobile ? '10px' : '8px', 
            borderRadius: '8px', 
            border: 'none', 
            background: activeTab === 'direct' ? 'hsla(0,0%,100%,0.07)' : 'transparent',
            color: activeTab === 'direct' ? 'white' : 'hsl(var(--text-muted))',
            fontSize: isMobile ? '0.7rem' : '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <MessageCircle size={14} /> DIRECT
        </button>
      </div>

      {/* Emote Picker (Simple) */}
      {activeTab === 'global' && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid var(--glass-border)' }}>
          {EMOTES.map(emote => (
            <button 
              key={emote} 
              onClick={() => setInputText(prev => prev + emote)}
              style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
              className="hover:scale-125 transition-transform"
            >
              {emote}
            </button>
          ))}
        </div>
      )}

      <header style={{ padding: isMobile ? '12px 16px' : '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeTab === 'global' ? (
            <>
              <MessageSquare size={16} color="hsl(var(--primary))" />
              <span style={{ fontWeight: 700, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>LIVE CHAT</span>
            </>
          ) : (
            <>
              <MessageCircle size={16} color="hsl(var(--accent))" />
              <span style={{ fontWeight: 700, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                {activeConversation ? activeConversation : 'MESSAGES'}
              </span>
            </>
          )}
        </div>
        {activeTab === 'global' && (
          <button 
            onClick={() => useCasinoStore.getState().triggerRain(100)}
            className="btn btn-ghost" 
            style={{ padding: '4px 8px', color: 'hsl(var(--success))', fontSize: '0.7rem', gap: '4px' }}
          >
            <span style={{ fontSize: '1rem' }}>🌧</span> RAIN
          </button>
        )}
        {activeTab === 'direct' && activeConversation && (
          <button onClick={() => setActiveConversation(null)} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>BACK</button>
        )}
      </header>

      <div 
        ref={scrollRef}
        style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        {activeTab === 'global' ? (
          chatMessages.map((msg) => {
            const isSystem = msg.user === 'System' || msg.user === 'Trivia Bot';
            const isWin = msg.text.includes('just won') || msg.text.includes('JUST WON');
            const isAchievement = msg.text.includes('unlocked') || msg.text.includes('Achievement');

            return (
              <div key={msg.id} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px',
                padding: isWin || isAchievement ? '10px' : '0',
                background: isWin ? 'hsla(var(--success), 0.05)' : isAchievement ? 'hsla(var(--accent), 0.05)' : 'transparent',
                borderRadius: '8px',
                border: isWin ? '1px solid hsla(var(--success), 0.1)' : isAchievement ? '1px solid hsla(var(--accent), 0.1)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isSystem && (
                    <span style={{ 
                      fontSize: '0.6rem', 
                      fontWeight: 900, 
                      color: 'black',
                      background: (msg.vipTier || 1) >= 100 ? '#b9f2ff' : (msg.vipTier || 1) >= 50 ? '#e5e4e2' : (msg.vipTier || 1) >= 25 ? '#ffd700' : (msg.vipTier || 1) >= 10 ? '#c0c0c0' : '#cd7f32',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      boxShadow: (msg.vipTier || 1) >= 25 ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none'
                    }}>
                      {(msg.vipTier || 1) >= 100 ? '💎' : (msg.vipTier || 1) >= 50 ? '🥈' : (msg.vipTier || 1) >= 25 ? '🥇' : '⭐'} {(msg.vipTier || 1)}
                    </span>
                  )}
                  <span 
                    onClick={() => !isSystem && setSelectedUser({ name: msg.user, level: msg.vipTier || 1, rank: 'Bronze' })}
                    style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 800, 
                      color: isSystem ? 'hsl(var(--primary))' : 'hsl(var(--text-main))',
                      cursor: !isSystem ? 'pointer' : 'default'
                    }} className={!isSystem ? 'hover:underline' : ''}>
                    {msg.user}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>{msg.time}</span>
                </div>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: isSystem ? 'hsl(var(--primary))' : 'hsl(var(--text-main))', 
                  lineHeight: 1.4,
                  fontWeight: isWin || isAchievement ? 700 : 400
                }}>
                  {msg.text}
                </p>
              </div>
            );
          })
        ) : (
          /* Direct Messages View */
          !activeConversation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700, marginBottom: '8px' }}>FRIENDS</p>
              {friends.map(friend => (
                <div 
                  key={friend} 
                  onClick={() => setActiveConversation(friend)}
                  style={{ 
                    padding: '12px', 
                    background: 'hsla(0,0%,100%,0.03)', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  className="hover:bg-white/10"
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'hsl(var(--surface-raised))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{friend}</span>
                </div>
              ))}
            </div>
          ) : (
            (directMessages[activeConversation] || []).map((msg) => (
              <div key={msg.id} style={{ alignSelf: msg.user === 'You' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ 
                  padding: '10px 14px', 
                  background: msg.user === 'You' ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.05)',
                  color: msg.user === 'You' ? 'black' : 'white',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', marginTop: '4px', textAlign: msg.user === 'You' ? 'right' : 'left' }}>{msg.time}</div>
              </div>
            ))
          )
        )}
      </div>

      <div style={{ padding: isMobile ? '12px' : '16px', borderTop: '1px solid var(--glass-border)', paddingBottom: isMobile ? '24px' : '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            className="input" 
            placeholder={activeTab === 'direct' && !activeConversation ? "Select friend..." : "Message..."}
            disabled={activeTab === 'direct' && !activeConversation}
            style={{ fontSize: '0.9rem', height: isMobile ? '48px' : '44px' }}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (activeTab === 'global' ? handleSend() : handleSendDirect())}
          />
          <button className="btn btn-primary" style={{ padding: '0 16px', height: isMobile ? '48px' : '44px' }} onClick={activeTab === 'global' ? handleSend : handleSendDirect}>
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <PlayerProfileModal 
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          username={selectedUser.name}
          level={selectedUser.level}
          rank={selectedUser.rank}
        />
      )}
    </div>
  );
}
