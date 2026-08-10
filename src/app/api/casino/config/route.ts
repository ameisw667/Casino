import { NextResponse } from 'next/server';
import { loadVipConfig } from '@/lib/casino/vip-config-server';
import { loadGameConfig } from '@/lib/casino/game-config-server';
import { loadAchievementConfig } from '@/lib/casino/achievements-config-server';
import { CasinoLogger } from '@/lib/casino/logger';

export async function GET() {
  try {
    const [vipConfig, gameConfig, achievementConfigs] = await Promise.all([
      loadVipConfig(),
      loadGameConfig(),
      loadAchievementConfig(),
    ]);
    return NextResponse.json({ ...vipConfig, gameConfig, achievementConfigs });
  } catch (error) {
    CasinoLogger.error('API/Casino/Config', 'Failed to load configuration', error);
    return NextResponse.json({ error: 'Unable to load configuration' }, { status: 500 });
  }
}
