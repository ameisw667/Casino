import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GuideMessageList } from '../GuideMessageList';

describe('GuideMessageList', () => {
  it('shows the Royale Guide welcome artwork before the player sends a first message', () => {
    const markup = renderToStaticMarkup(
      createElement(GuideMessageList, {
        turns: [{ id: 'intro', role: 'guide', text: 'Willkommen', time: '10:00' }],
        isSending: false,
        isExpanded: false,
        copiedId: null,
        feedbackMap: {},
        playingMessageId: null,
        onActionClick: () => undefined,
        onSuggestionClick: () => undefined,
        onPlayVoice: () => undefined,
        onCopy: () => undefined,
        onFeedback: () => undefined,
      }),
    );

    expect(markup).toContain('royale-guide-mascot-white.png');
    expect(markup).toContain('Royale Guide begruesst dich');
  });
});
