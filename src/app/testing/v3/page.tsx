import { Metadata } from 'next';
import { TestingV3HeroStage } from '@/components/testing/v3/TestingV3HeroStage';
import { TestingV3BentoShowcase } from '@/components/testing/v3/TestingV3BentoShowcase';

export const metadata: Metadata = {
  title: 'V3 Laboratory: Awwwards 3D Scrollytelling Hero | Casino Royale',
  description:
    'Isolierter Labor-Prototyp des multidimensionalen 2.5D/3D Hero Scrollytellings mit GSAP ScrollTrigger, Shader Warp, Partikel-Vortex und 180° Karten-Morph.',
};

export default function TestingV3LaboratoryPage() {
  return (
    <main
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#0B0E14',
        color: '#FFFFFF',
      }}
    >
      {/* Suppress Next.js dev overlay indicator & build badges on isolated testing route */}
      <style>{`
        #__next-build-watcher,
        [data-nextjs-toast],
        [data-nextjs-dialog-overlay],
        nextjs-portal,
        div[data-nextjs-dev-tools-button],
        div[class*="nextjs-toast"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>

      {/* 220vh 3D Scrollytelling Hero Stage */}
      <TestingV3HeroStage />

      {/* Seamless Transition into Live Bento Gaming Arena */}
      <TestingV3BentoShowcase />
    </main>
  );
}
