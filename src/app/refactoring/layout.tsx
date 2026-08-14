import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lobby v2 · Refactoring-Testseite',
  description:
    'Eigenständige Lobby-Konzeption mit Three.js, GSAP und Frosted-Obsidian-Glass — isolierte Testseite unter /refactoring (nur Startseite, keine Spiele-Routen).',
  robots: { index: false, follow: false },
};

export default function RefactoringLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
