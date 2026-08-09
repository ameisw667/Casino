'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎰</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffd700', marginBottom: '16px' }}>
        TABLE NOT FOUND
      </h1>
      <p style={{ color: '#aaa', marginBottom: '32px', maxWidth: '500px' }}>
        This table doesn&apos;t exist in our casino. Perhaps you took a wrong turn at the VIP
        lounge.
      </p>
      <Link
        href="/"
        style={{
          background: '#ffd700',
          color: '#000',
          padding: '12px 32px',
          borderRadius: '8px',
          fontWeight: 900,
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Back to Lobby
      </Link>
    </div>
  );
}
