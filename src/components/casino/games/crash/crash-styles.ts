/**
 * Crash page scoped CSS (rendered via <style>{crashStyles}</style>).
 * Extracted verbatim from crash/page.tsx — pure move, no rule changes.
 */
export const crashStyles = `
.crash-container {
  display: grid;
  grid-template-columns: 330px 1fr;
  align-items: start;
  gap: 20px;
  width: 100%;
  max-width: 1600px;
  min-width: 0;
  box-sizing: border-box;
  margin: 0 auto;
}
@media (max-width: 960px) {
  .crash-container {
    grid-template-columns: 1fr;
  }
  .sidebar-left { order: 2; width: 100%; min-width: 0; }
  .game-area { order: 1; width: 100%; min-width: 0; }
}
.obsidian-glass {
  background: rgba(14, 14, 20, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.15);
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
}
.gold-btn {
  background: linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%);
  color: #050508;
  font-weight: 900;
  box-shadow: 0 6px 25px rgba(212, 175, 55, 0.35);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.gold-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.5);
  filter: brightness(1.1);
}
.emerald-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-weight: 900;
  box-shadow: 0 6px 30px rgba(16, 185, 129, 0.45);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.emerald-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 35px rgba(16, 185, 129, 0.6);
  filter: brightness(1.1);
}
.quick-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 7px 0;
  border-radius: 8px;
  transition: all 0.15s ease;
  cursor: pointer;
}
.quick-chip:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.4);
  color: #FFD700;
  transform: translateY(-1px);
}
.quick-chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@keyframes milestone-pop {
  0% { opacity: 0; transform: translate(-50%, -40%) scale(0.6); }
  20% { opacity: 1; transform: translate(-50%, -55%) scale(1.15); }
  40% { transform: translate(-50%, -50%) scale(1); }
  75% { opacity: 1; transform: translate(-50%, -65%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -90%) scale(0.9); }
}
.milestone-pop {
  animation: milestone-pop 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes radar-pulse {
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.9; }
  100% { transform: scale(0.95); opacity: 0.5; }
}
.radar-glow {
  animation: radar-pulse 2.5s ease-in-out infinite;
}
`;
