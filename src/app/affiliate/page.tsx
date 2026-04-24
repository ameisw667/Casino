import Image from 'next/image';

export default function AffiliatePage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <header style={{ 
        position: 'relative', 
        height: '350px', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '60px',
        border: '1px solid hsla(0,0%,100%,0.05)'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/affiliate-hero.png" 
            alt="Affiliate Hero" 
            fill 
            style={{ objectFit: 'cover', opacity: 0.5 }}
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to right, hsl(var(--bg-color)) 0%, transparent 100%)' 
          }} />
        </div>
        <h1 className="text-gradient" style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>Affiliate <br /> Program</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', maxWidth: '500px', marginTop: '12px' }}>Invite your friends and build your gaming empire. Earn passive income on every wager.</p>
      </header>

      <div className="grid-cols-auto" style={{ marginBottom: '40px' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <CircleDollarSign size={32} color="hsl(var(--success))" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '2rem' }}>$0.00</h3>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>TOTAL EARNED</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <Users size={32} color="hsl(var(--primary))" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '2rem' }}>0</h3>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>REFERRED FRIENDS</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <TrendingUp size={32} color="hsl(var(--secondary))" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '2rem' }}>5%</h3>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>COMMISSION RATE</p>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Your Referral Link</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input className="input mono" readOnly value="https://casino.vibe/ref/user_123" />
          <button className="btn btn-primary">
            <Copy size={18} /> Copy
          </button>
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
          Share this link with your community. You receive a 5% revenue share on the house edge of every bet placed by your referrals.
        </p>
      </div>
    </div>
  );
}
