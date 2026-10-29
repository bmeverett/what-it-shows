// The problems inside a merged ticket. causes.ts says which bug a flipped date comes from; a report
// the desk read as a one-day move (desk-notes.json) is no flip at all, so it is its own problem.
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem };

export function mergedInto(reports: Report[], ticket: number): Report[] {
  return uniqueById(reports).filter((r) => r.mergedInto === ticket);
}

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  const flipped = reports.filter((r) => !oneDayMove.includes(r.id));
  const groups: ProblemGroup[] = groupByCause(flipped, tenantOf).map(({ cause, ...g }) => ({ problem: cause, ...g }));
  if (moved.length) {
    const { cause: _, ...g } = groupByCause(moved, () => undefined)[0];
    groups.push({ problem: 'one-day', ...g });
  }
  return groups.sort((a, b) => b.reports.length - a.reports.length);
}
