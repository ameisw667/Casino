import type { HistoryRow } from './HistoryTableStream';

export interface SessionGroup {
  id: string;
  label: string;
  totalBets: number;
  netProfit: number;
  rows: HistoryRow[];
}

export type HistoryVirtualItem =
  { type: 'header'; group: SessionGroup } | { type: 'row'; group: SessionGroup; row: HistoryRow };

const SESSION_GAP_MS = 25 * 60 * 1000;

function buildSessionLabel(rowDate: Date): string {
  const dateLabel = rowDate.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
  });
  const timeLabel = rowDate.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `Sitzung ${dateLabel} (${timeLabel})`;
}

export function groupRowsIntoSessions(rows: HistoryRow[]): SessionGroup[] {
  if (rows.length === 0) return [];

  const groups: SessionGroup[] = [];
  let currentGroup: SessionGroup | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowDate = new Date(row.created_at);
    const prevRow = rows[i - 1];
    const prevDate = prevRow ? new Date(prevRow.created_at) : null;

    const isNewSession =
      !prevDate || Math.abs(prevDate.getTime() - rowDate.getTime()) > SESSION_GAP_MS;

    if (isNewSession || !currentGroup) {
      currentGroup = {
        id: `session-${i}-${row.id}`,
        label: buildSessionLabel(rowDate),
        totalBets: 0,
        netProfit: 0,
        rows: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.rows.push(row);
    currentGroup.totalBets += 1;
    currentGroup.netProfit += row.amount;
  }

  return groups;
}

export function flattenSessionGroups(groups: SessionGroup[]): HistoryVirtualItem[] {
  const items: HistoryVirtualItem[] = [];
  for (const group of groups) {
    items.push({ type: 'header', group });
    for (const row of group.rows) {
      items.push({ type: 'row', group, row });
    }
  }
  return items;
}
