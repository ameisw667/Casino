'use client';

interface DiceCenterStageInitialProps {
  onRequestInteractive: () => void;
}

/**
 * Mobile first-paint shell for Dice. It deliberately has no animation, canvas,
 * Web Audio, or 3D dependencies; the interactive stage replaces it after idle.
 */
export function DiceCenterStageInitial({ onRequestInteractive }: DiceCenterStageInitialProps) {
  return (
    <div
      className="dice-v2-main game-area dice-v2-initial"
      onPointerDown={onRequestInteractive}
      style={{
        borderRadius: '24px',
        backgroundColor: '#07090E',
        backgroundSize: 'cover',
        backgroundPosition: 'center 45%',
        backgroundRepeat: 'no-repeat',
        border: '1.5px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), inset 0 0 60px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <div className="dice-v2-initial__header">
        <span>DICE 3D ARCADE</span>
        <span>READY</span>
      </div>
      <div className="dice-v2-initial__arena" aria-hidden="true">
        <div className="dice-v2-initial__die">
          <span>?</span>
        </div>
      </div>
      <div className="dice-v2-initial__status">
        <span>TARGET</span>
        <strong>50.50</strong>
      </div>
    </div>
  );
}