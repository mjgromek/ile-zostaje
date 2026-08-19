/**
 * The unit the amount is typed in, and the conversion into the one period the
 * whole engine speaks: a month.
 *
 * 52 and 12 are CALENDAR arithmetic, not tax-year facts, so they live here and
 * never in `rates-2026.ts`. Nothing here can be read off zus.pl or
 * podatki.gov.pl, and nothing here should be: the sentence under the field
 * prints the operation in full, and visibility is the substitute for citation —
 * the stronger one, because a reader can reproduce the app's own figure from it.
 *
 * The app owns no hours-per-month number at all. Kodeks pracy art. 130's
 * nominal month runs roughly 152–184 h across 2026, so any fixed figure is
 * invented, and 173⅓ — derivable from the statutory 40-hour week, art. 129 §1 —
 * is wrong for this product's audience: a student working 20 h a week told they
 * earn 6 066 zł a month has been confidently misinformed about their own pay.
 * The hour unit asks instead.
 */

export type Unit = 'hour' | 'week' | 'month' | 'year';

/** Display order, and the order the four options ship in. */
export const UNITS: Unit[] = ['hour', 'week', 'month', 'year'];

export const WEEKS_PER_YEAR = 52;

/**
 * Owned here rather than imported from `contract.ts`: spreading an annual tax
 * threshold over a year and dividing a calendar year into months are two
 * concerns that happen to share a number, and one may need to stop being the
 * other's twin without warning.
 */
export const MONTHS_PER_YEAR = 12;

/** The field's default, editable and persisted — never a rate in a branch. */
export const DEFAULT_HOURS_PER_WEEK = '40';

/** A week has 168 hours. A physical bound, not a policy. */
export const MAX_HOURS_PER_WEEK_TENTHS = 1_680;

/** Hours a week are carried in TENTHS, so the arithmetic never leaves whole
 *  numbers: 37,5 h is 375, and `37,5 × 52 ÷ 12` stays an integer division. */
const TENTHS = 10;

/**
 * Divide and round half up, on integers only. Everything here is grosz or
 * tenths of an hour, so no intermediate is ever a fraction of a currency unit
 * and no result depends on binary floating point.
 */
function divRoundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

export type HoursInput = { kind: 'ok'; tenths: number } | { kind: 'error' };

/**
 * How many hours a week, as typed. One decimal, comma or dot — `37,5` is an
 * ordinary Polish contract. Empty, zero, a word and anything above the 168
 * hours a week contains are one case: this is not a number of hours, so the
 * screen says so and the result goes null rather than falling back to a figure
 * nobody entered.
 */
export function parseHours(text: string): HoursInput {
  const normalised = text.trim().replace(',', '.');
  if (!/^\d+(\.\d)?$/.test(normalised)) return { kind: 'error' };
  const tenths = Math.round(Number(normalised) * TENTHS);
  if (tenths <= 0 || tenths > MAX_HOURS_PER_WEEK_TENTHS) return { kind: 'error' };
  return { kind: 'ok', tenths };
}

/**
 * The typed amount as a monthly one. This is THE rounding boundary: one
 * rounding, here, and everything downstream is the shipped monthly pipeline
 * untouched. Nothing may round on the way in and round again on the way here.
 */
export function toMonthlyGrosz(amountGrosz: number, unit: Unit, hoursTenths: number): number {
  switch (unit) {
    case 'hour':
      return divRoundHalfUp(
        amountGrosz * hoursTenths * WEEKS_PER_YEAR,
        MONTHS_PER_YEAR * TENTHS,
      );
    case 'week':
      return divRoundHalfUp(amountGrosz * WEEKS_PER_YEAR, MONTHS_PER_YEAR);
    case 'year':
      return divRoundHalfUp(amountGrosz, MONTHS_PER_YEAR);
    case 'month':
      return amountGrosz;
  }
}

/**
 * The inverse, for the echo line under the answer. Applied ONCE to the monthly
 * grosz — never chained through the typed amount, which would compound the
 * rounding the boundary above already paid for.
 */
export function fromMonthlyGrosz(monthlyGrosz: number, unit: Unit, hoursTenths: number): number {
  switch (unit) {
    case 'hour':
      return divRoundHalfUp(
        monthlyGrosz * MONTHS_PER_YEAR * TENTHS,
        WEEKS_PER_YEAR * hoursTenths,
      );
    case 'week':
      return divRoundHalfUp(monthlyGrosz * MONTHS_PER_YEAR, WEEKS_PER_YEAR);
    case 'year':
      return monthlyGrosz * MONTHS_PER_YEAR;
    case 'month':
      return monthlyGrosz;
  }
}

/**
 * The largest amount this unit may carry, given the monthly cap the solver's
 * work is bounded by. FLOORED, not rounded: the answer has to be a value that
 * actually converts back inside the cap, or the field would state a maximum it
 * then refuses. `35 000 zł/godz.` is 60 666 667 zł a month, and this is what
 * stops it reaching the engine.
 */
export function maxInUnitGrosz(maxMonthlyGrosz: number, unit: Unit, hoursTenths: number): number {
  switch (unit) {
    case 'hour':
      return Math.floor(
        (maxMonthlyGrosz * MONTHS_PER_YEAR * TENTHS) / (WEEKS_PER_YEAR * hoursTenths),
      );
    case 'week':
      return Math.floor((maxMonthlyGrosz * MONTHS_PER_YEAR) / WEEKS_PER_YEAR);
    case 'year':
      return maxMonthlyGrosz * MONTHS_PER_YEAR;
    case 'month':
      return maxMonthlyGrosz;
  }
}
