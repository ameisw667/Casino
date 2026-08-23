import type { Achievement } from './achievements-config';

export interface AchievementPresentation {
  isMystery: boolean;
  icon: string;
  title: string;
  description: string;
  showProgress: boolean;
}

const LOCKED_SECRET_PRESENTATION: AchievementPresentation = {
  isMystery: true,
  icon: '🔒',
  title: 'MYSTERY ACHIEVEMENT',
  description: 'Keep playing to reveal this achievement.',
  showProgress: false,
};

/**
 * Keeps a secret achievement's configuration out of the pre-unlock UI. This is
 * a presentation rule only: achievement_configs remains intentionally public.
 */
export function getAchievementPresentation(achievement: Achievement): AchievementPresentation {
  if (achievement.visibility === 'secret' && !achievement.unlocked) {
    return LOCKED_SECRET_PRESENTATION;
  }

  return {
    isMystery: false,
    icon: achievement.icon,
    title: achievement.title,
    description: achievement.description,
    showProgress: !achievement.unlocked,
  };
}
