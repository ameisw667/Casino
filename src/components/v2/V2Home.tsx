'use client';

import React, { useState } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { V2Header } from './V2Header';
import { V2Sidebar } from './V2Sidebar';
import { V2Hero } from './V2Hero';
import { V2PromoBento } from './V2PromoBento';
import { V2GameTabs } from './V2GameTabs';
import { V2RebateWidget } from './V2RebateWidget';

export function V2Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const balance = useCasinoStore((s) => s.balance);
  const level = useCasinoStore((s) => s.level);
  const rank = useCasinoStore((s) => s.rank);

  return (
    <div className="v2-root">
      <div className="v2-shell">
        <div className="v2-window">
          <div className="v2-window-grid">
            <V2Header balance={balance} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
            <V2Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              level={level}
              rank={rank}
            />
            <main className="v2-main">
              <V2Hero />
              <V2PromoBento />
              <div className="v2-bottom-row">
                <V2GameTabs />
                <V2RebateWidget />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
