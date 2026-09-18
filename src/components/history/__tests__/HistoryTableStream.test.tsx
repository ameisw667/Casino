// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HistoryTableStream, type HistoryRow } from '../HistoryTableStream';

// jsdom does not implement layout: getBoundingClientRect() returns all-zero
// and ResizeObserver does not exist. Without mocking these, @tanstack/react-virtual
// computes a total size of 0 and renders zero virtual items even though the
// component itself is correct — a documented jsdom limitation, not a bug.
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      width: 800,
      height: 52,
      top: 0,
      left: 0,
      bottom: 52,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    }),
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: 800,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: 800,
  });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });

  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function buildRows(count: number): HistoryRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
    game: i % 2 === 0 ? 'dice' : 'crash',
    type: 'bet',
    amount: i % 2 === 0 ? 15 : -8,
    balance_after: 1000 - i,
    created_at: new Date(2026, 8, 14, 10, 0, 0, 0).toISOString(),
  }));
}

describe('HistoryTableStream', () => {
  it('renders the loading skeleton while loading', () => {
    const { container } = render(<HistoryTableStream loading rows={[]} />);
    expect(container.querySelector('div')).toBeTruthy();
    expect(screen.queryByText(/Keine Wetten/)).toBeNull();
  });

  it('renders the empty state when there are no rows', () => {
    render(<HistoryTableStream loading={false} rows={[]} />);
    expect(screen.getByText(/Keine Wetten im gewählten Filter gefunden/)).toBeTruthy();
  });

  it('calls onSelectRow when a row is clicked (desktop)', () => {
    const rows = buildRows(3);
    const onSelectRow = vi.fn();
    const { container } = render(
      <HistoryTableStream loading={false} rows={rows} onSelectRow={onSelectRow} />,
    );

    const dataRow = container.querySelector('[role="row"][data-index]') as HTMLElement | null;
    const clickableRows = Array.from(container.querySelectorAll('[role="row"]')).filter(
      (el) => el.getAttribute('role') === 'row' && el.querySelector('[role="cell"]'),
    );
    // Session header is also a role="row"; the bet row is whichever one is clickable
    // and triggers onSelectRow — verify by dispatching a click on each candidate.
    for (const el of clickableRows) {
      fireEvent.click(el);
    }
    expect(onSelectRow).toHaveBeenCalled();
    void dataRow;
  });

  it('shows the LoadMoreCTA and fires onLoadMore when hasMore is true', () => {
    const rows = buildRows(2);
    const onLoadMore = vi.fn();
    render(
      <HistoryTableStream
        loading={false}
        rows={rows}
        hasMore
        onLoadMore={onLoadMore}
        loadingMore={false}
      />,
    );

    const button = screen.getByText('Mehr laden');
    fireEvent.click(button);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('renders fewer DOM row nodes than total rows when virtualizing a large list', () => {
    const rows = buildRows(200);
    const { container } = render(<HistoryTableStream loading={false} rows={rows} />);

    const renderedRowCells = container.querySelectorAll('[role="row"] [role="cell"]');
    expect(renderedRowCells.length).toBeGreaterThan(0);
    expect(renderedRowCells.length).toBeLessThan(200);
  });
});
