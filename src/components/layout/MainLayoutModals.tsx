'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const BigWinOverlay = dynamic(() => import('../casino/BigWinOverlay'), { ssr: false });
const ProvablyFairModal = dynamic(
  () => import('../casino/ProvablyFairModal').then((mod) => mod.ProvablyFairModal),
  { ssr: false },
);
const SettingsModal = dynamic(() => import('../casino/SettingsModal'), { ssr: false });
const RankBenefitsModal = dynamic(() => import('../casino/RankBenefitsModal'), { ssr: false });
const PlayerProfileModal = dynamic(() => import('@/components/casino/PlayerProfileModal'), {
  ssr: false,
});
const GlobalChat = dynamic(
  () => import('@/components/social/GlobalChat').then((mod) => mod.GlobalChat),
  { ssr: false },
);

interface MainLayoutModalsProps {
  bigWin: { amount: number; multiplier: number } | null;
  setBigWin: (val: { amount: number; multiplier: number } | null) => void;
  showRankInfo: boolean;
  setShowRankInfo: (val: boolean) => void;
  showProfile: boolean;
  setShowProfile: (val: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (val: boolean) => void;
}

export function MainLayoutModals({
  bigWin,
  setBigWin,
  showRankInfo,
  setShowRankInfo,
  showProfile,
  setShowProfile,
  showSettingsModal,
  setShowSettingsModal,
}: MainLayoutModalsProps) {
  return (
    <>
      {bigWin && (
        <BigWinOverlay
          amount={bigWin.amount}
          multiplier={bigWin.multiplier}
          isOpen={Boolean(bigWin)}
          onClose={() => setBigWin(null)}
        />
      )}
      {showRankInfo && (
        <RankBenefitsModal isOpen={showRankInfo} onClose={() => setShowRankInfo(false)} />
      )}
      {showProfile && (
        <PlayerProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
      )}
      {showSettingsModal && (
        <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      )}
      <GlobalChat />
    </>
  );
}
