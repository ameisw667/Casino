import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GuideThinkingSkeleton } from '../GuideThinkingSkeleton';

describe('GuideThinkingSkeleton', () => {
  it('shows the Royale Guide thinking artwork while an answer is being prepared', () => {
    const markup = renderToStaticMarkup(createElement(GuideThinkingSkeleton));

    expect(markup).toContain('royale-guide-thinking.png');
    expect(markup).toContain('Royale Guide denkt nach');
  });
});
