'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';
import AdminLayout from './AdminLayout';
import OnboardingFlow from './OnboardingFlow';
import { useMounted } from '@/hooks/useMounted';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isSandboxV2 = pathname === '/v2' || pathname?.startsWith('/v2/');
  const isRefactoring = pathname === '/refactoring' || pathname?.startsWith('/refactoring/');
  const isTesting = pathname === '/testing' || pathname?.startsWith('/testing/');
  // Motion-Lab: /games-2 ist eine eigenständige Testing-Route ohne Shell & Auth,
  // damit Motion-Prototypen unverfälscht (ohne HUD/Session-Ablenkung) geprüft werden.
  const isMotionLab = pathname === '/games-2';
  // PULS-Partikel-Lab ("/lab"): eigene Bare-Sandbox, wie /games-2 aber isoliertes
  // WebGL-Experiment (T_FRONTEND/02-4). Bewusst eigener Flag-Name, keine Kollision.
  const isParticleLab = pathname === '/lab' || pathname?.startsWith('/lab/');
  const mounted = useMounted();

  // Einzige Testing-Route im Live-Shell-Kontext: /testing/lobby-bento prüft das
  // Bento-Redesign bewusst unter Sidebar/Header wie in der echten Lobby.
  const isTestingWithShell = pathname === '/testing/lobby-bento';

  // Standalone design-sandbox & testing routes: render their own header/sidebar/hero,
  // must never inherit the live app's MainLayout nav.
  if (
    (isSandboxV2 || isRefactoring || isTesting || isMotionLab || isParticleLab) &&
    !isTestingWithShell
  ) {
    return <>{children}</>;
  }

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <div suppressHydrationWarning>
      <MainLayout>{children}</MainLayout>
      {mounted && <OnboardingFlow />}
    </div>
  );
}
