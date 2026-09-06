import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { TournamentPodiumStrip } from '../BentoStripCells';

describe('TournamentPodiumStrip', () => {
  it('shows the generated tournament trophy in its title block', () => {
    const markup = renderToStaticMarkup(createElement(TournamentPodiumStrip, { isMobile: false }));

    expect(markup).toContain('trophy-tournament-gold.png');
    expect(markup).toContain('Turnierpokal');
  });
});
