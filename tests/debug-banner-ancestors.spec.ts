import { test } from '@playwright/test';

test('debug fixed positioning and ancestor transforms', async ({ page }) => {
  await page.goto('http://localhost:3015/');
  await page.waitForLoadState('networkidle');

  const bannerInfo = await page.evaluate(() => {
    const el = document.querySelector('div[role="dialog"]');
    if (!el) return { error: 'Banner element not found' };

    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    // Trace ancestors and look for transform / filter / perspective / contain
    const ancestors = [];
    let current = el.parentElement;
    while (current && current !== document.documentElement) {
      const style = window.getComputedStyle(current);
      ancestors.push({
        tag: current.tagName,
        id: current.id,
        className: current.className,
        position: style.position,
        transform: style.transform,
        filter: style.filter,
        perspective: style.perspective,
        contain: style.contain,
        overflow: style.overflow,
      });
      current = current.parentElement;
    }

    return {
      element: {
        position: computed.position,
        top: computed.top,
        bottom: computed.bottom,
        left: computed.left,
        right: computed.right,
        transform: computed.transform,
        opacity: computed.opacity,
        zIndex: computed.zIndex,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom,
        },
      },
      ancestors,
    };
  });

  console.log('Banner Info:', JSON.stringify(bannerInfo, null, 2));
});
