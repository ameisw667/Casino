import { HomeClient } from '@/components/home/HomeClient';

export default function Home() {
  return (
    <div className="glass" style={{ 
      minHeight: '100vh', 
      background: 'hsla(var(--bg-color), 1)',
      padding: 'clamp(0px, 2vw, 24px)' 
    }}>
      <HomeClient />
    </div>
  );
}
