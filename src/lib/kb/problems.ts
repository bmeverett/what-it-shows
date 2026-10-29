// The problems inside a merged ticket. causes.ts says which bug a flipped date comes from. A report
// the desk read as a one-day move (desk-notes.json) is no flip at all, so it is a problem of its own;
// like the desk, we still count it where it is filed.
import { groupByCause, readAs, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem; readAsOneDay: number };

export function mergedInto(reports: Report[], ticket: number): Report[] {
  return uniqueById(reports).filter((r) => r.mergedInto === ticket);
}

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const groups: ProblemGroup[] = groupByCause(reports, tenantOf).map(({ cause, ...g }) => ({
    problem: cause,
    ...g,
    readAsOneDay: readAs({ cause, ...g }, oneDayMove),
  }));
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const { cause: _, ...g } = groupByCause(moved, () => undefined)[0];
    groups.push({ problem: 'one-day', ...g, readAsOneDay: 0 });
  }
  return groups;
}
