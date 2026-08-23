export const dicePageStyles = `
.dice-container {
  display: grid;
  grid-template-columns: 330px 1fr;
  gap: 20px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
@media (max-width: 1024px) {
  .dice-container {
    grid-template-columns: 1fr;
    flex-wrap: nowrap !important;
  }
  .dice-sidebar {
    order: 2 !important;
    width: 100% !important;
    min-width: 0 !important;
  }
  .dice-main {
    order: 1 !important;
    width: 100% !important;
  }
  .dice-stat-grid {
    grid-template-columns: 1fr 1fr !important;
  }
  .dice-stat-grid > div {
    min-width: 0 !important;
  }
  .dice-stat-grid > div:last-child {
    grid-column: span 2 !important;
  }
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
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #FFD700;
  transform: translateY(-1px);
}
.quick-chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.hud-card {
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.2s ease;
}
.hud-card:focus-within {
  border: 1px solid rgba(212, 175, 55, 0.6);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.15);
}
@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
`;
