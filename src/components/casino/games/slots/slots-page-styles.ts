export const slotsPageStyles = `
@media (max-width: 1360px) {
  .slots-page-container {
    grid-template-columns: 310px 1fr !important;
  }
  .slots-right-paytable {
    grid-column: span 2;
    order: 3;
  }
}
@media (max-width: 960px) {
  .slots-page-container {
    grid-template-columns: 1fr !important;
  }
  .slots-left-controls {
    order: 2 !important;
  }
  .slots-center-stage {
    order: 1 !important;
  }
  .slots-right-paytable {
    grid-column: span 1;
    order: 3 !important;
  }
}
.obsidian-glass {
  background: rgba(14, 14, 20, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.05);
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
.quick-mod-btn {
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
.quick-mod-btn:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #FFD700;
  transform: translateY(-1px);
}
.quick-mod-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
`;
