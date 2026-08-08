import { Metadata } from 'next';
import { HomeClientV2 } from '@/components/home/HomeClientV2';

export const metadata: Metadata = {
  title: 'Casino Royale | Premium Provably Fair Gaming',
  description: "The world's most transparent gaming ecosystem. Powered by deep-learning security and the fastest crypto rails in existence. Provably fair, instant payouts, and premium 3D gaming.",
};

export default function Home() {
  return (
    <div className="glass" style={{
      minHeight: '100vh',
      background: 'hsla(var(--bg-color), 1)',
      padding: 'clamp(0px, 2vw, 24px)'
    }}>
      <HomeClientV2 />
    </div>
  );
}
