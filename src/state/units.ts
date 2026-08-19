/**
 * The unit the amount is typed in, and the conversion into the one period the
 * whole engine speaks: a month.
 *
 * 52 and 12 are CALENDAR arithmetic, not tax-year facts, so they live here and
 * never in `rates-2026.ts`. Nothing here can be read off zus.pl or
 * podatki.gov.pl, and nothing here should be: the sentence under the field
 * prints the operation in full, and visibility is the substitute for citation.
 *
 * The app owns no hours-per-month number at all. Kodeks pracy art. 130's
 * nominal month runs roughly 152–184 h across 2026, so any fixed figure is
 * invented, and 173⅓ — derivable from the statutory 40-hour week — is wrong for
 * a student on 20 h/week. The hour unit asks instead.
 */

export type Unit = 'hour' | 'week' | 'month' | 'year';

/** Display order, and the order the four options ship in. */
export const UNITS: Unit[] = ['hour', 'week', 'month', 'year'];

export const WEEKS_PER_YEAR = 52;

/**
 * Owned here rather than imported from `contract.ts`: spreading an annual tax
 * threshold over a year and dividing a calendar year into months are two
 * concerns that happen to share a number.
 */
export const MONTHS_PER_YEAR = 12;

/** The field's default, editable and persisted — never a rate in a branch. */
export const DEFAULT_HOURS_PER_WEEK = '40';

/** A week has 168 hours. A physical bound, not a policy. */
export const MAX_HOURS_PER_WEEK_TENTHS = 1_680;

export type HoursInput = { kind: 'ok'; tenths: number } | { kind: 'error' };

export function parseHours(_text: string): HoursInput {
  return { kind: 'error' };
}

export function toMonthlyGrosz(_amountGrosz: number, _unit: Unit, _hoursTenths: number): number {
  return 0;
}

export function fromMonthlyGrosz(_monthlyGrosz: number, _unit: Unit, _hoursTenths: number): number {
  return 0;
}

export function maxInUnitGrosz(_maxMonthlyGrosz: number, _unit: Unit, _hoursTenths: number): number {
  return 0;
}
