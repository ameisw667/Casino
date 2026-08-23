export const roulettePageStyles = `
        .roulette-page {
          display: grid;
          grid-template-columns: 330px 1fr;
          gap: 20px;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        @media (max-width: 1024px) {
          .roulette-page {
            grid-template-columns: 1fr;
          }
          .roulette-left {
            order: 2 !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          .roulette-center {
            order: 1 !important;
            min-width: 0;
            width: 100%;
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
        .gold-btn-inactive {
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #FFD700;
          font-weight: 900;
          transition: all 0.2s ease;
        }
        .gold-btn-inactive:hover {
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.6);
          transform: translateY(-1px);
        }
        .quick-chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 8px 0;
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
        .felt-cell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-weight: 900;
          font-family: monospace;
          cursor: pointer;
          user-select: none;
          transition: all 0.15s ease;
        }
        .felt-cell:hover {
          filter: brightness(1.3);
          transform: scale(1.02);
          z-index: 10;
        }
        .table-chip-badge {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 20;
        }
      `;
