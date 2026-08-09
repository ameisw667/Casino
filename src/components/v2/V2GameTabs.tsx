import React from 'react';
import Link from 'next/link';
import { LayoutGrid, Spade, TrendingUp, Dice5, Disc3, Cherry, type LucideIcon } from 'lucide-react';
import { V2_GAME_TABS } from './v2-data';

const TAB_ICONS: Record<string, LucideIcon> = {
  all: LayoutGrid,
  blackjack: Spade,
  crash: TrendingUp,
  dice: Dice5,
  roulette: Disc3,
  slots: Cherry,
};

export function V2GameTabs() {
  return (
    <div className="v2-tabs">
      {V2_GAME_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.id] ?? LayoutGrid;
        const isActive = tab.id === 'all';
        return (
          <Link key={tab.id} href={tab.href} className={`v2-tab${isActive ? 'active' : ''}`}>
            {isActive && <span className="v2-tab-pill" />}
            <Icon size={15} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
