import { CrownEmblem } from './AuthBrandMarks';

interface AuthCardHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthCardHeader({ title, subtitle }: AuthCardHeaderProps) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
      <div
        className="auth-emblem-shine"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          margin: '0 auto 16px',
          background: 'linear-gradient(135deg, hsl(45,100%,50%), hsl(38,100%,40%))',
          boxShadow: '0 0 20px hsla(45,100%,50%,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CrownEmblem />
      </div>
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 900,
          margin: '0 0 8px',
          color: '#fff',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>{subtitle}</p>
    </div>
  );
}
