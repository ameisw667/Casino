import { ShieldAlert } from 'lucide-react';

interface AuthStatusBannerProps {
  loginCooldownSeconds: number;
  status: string | null;
}

export function AuthStatusBanner({ loginCooldownSeconds, status }: AuthStatusBannerProps) {
  if (loginCooldownSeconds > 0) {
    return (
      <div
        role="alert"
        style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'rgba(255, 179, 0, 0.1)',
          border: '1px solid rgba(255, 179, 0, 0.4)',
          color: '#ffc107',
          fontSize: '0.85rem',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textAlign: 'left',
        }}
      >
        <ShieldAlert size={20} color="#ffc107" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700 }}>Login vorübergehend gesperrt</div>
          <div style={{ opacity: 0.85, fontSize: '0.8rem', marginTop: '2px' }}>
            Zu viele Fehlversuche. Bitte warte noch <strong>{loginCooldownSeconds}s</strong> vor dem
            nächsten Versuch.
          </div>
        </div>
      </div>
    );
  }

  if (status) {
    return (
      <div
        role="alert"
        style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: 'rgba(255, 51, 102, 0.1)',
          border: '1px solid rgba(255, 51, 102, 0.3)',
          color: '#ff6688',
          fontSize: '0.85rem',
          marginBottom: '18px',
          textAlign: 'center',
        }}
      >
        {status}
      </div>
    );
  }

  return null;
}
