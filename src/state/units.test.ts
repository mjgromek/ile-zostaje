import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import {
  DEFAULT_HOURS_PER_WEEK,
  MONTHS_PER_YEAR,
  UNITS,
  WEEKS_PER_YEAR,
  fromMonthlyGrosz,
  maxInUnitGrosz,
  parseHours,
  toMonthlyGrosz,
} from './units';

// Slice 4, criterion 2. One rounding, at the boundary into the engine, on
// integers only. The three worked examples are DESIGN-SLICE-4 §3's own, and
// they are asserted to the grosz rather than to a tolerance: a tolerance is how
// a chained intermediate hides.

const H40 = 400; // 40 h/week, carried in tenths so the arithmetic stays whole

test('the conversion is one rounding at the engine boundary, to the grosz', () => {
  // §3's table, in grosz. 35 zł/h at 40 h/week is 6 066,67 zł a month and not
  // 6 066,55 — the second figure is what printing a rounded 173,33 h and
  // multiplying by it produces, which is the invisible lie this slice removes.
  expect(toMonthlyGrosz(3_500, 'hour', H40), '35 zł/h at 40 h/week').toBe(606_667);
  expect(toMonthlyGrosz(100_000, 'week', H40), '1 000 zł/week').toBe(433_333);
  expect(toMonthlyGrosz(450_000, 'month', H40), 'a month is identity').toBe(450_000);
  expect(toMonthlyGrosz(9_000_000, 'year', H40), '90 000 zł/year').toBe(750_000);

  // Every result is a whole number of grosz, at every unit and at awkward
  // amounts: an intermediate that left integer arithmetic would show here.
  for (const unit of UNITS) {
    for (const amount of [1, 7, 99, 3_333, 123_457, 99_999_999]) {
      const monthly = toMonthlyGrosz(amount, unit, 375);
      expect(Number.isInteger(monthly), `${unit} @ ${amount}`).toBe(true);
      expect(Number.isSafeInteger(monthly * 2), `${unit} @ ${amount} overflowed`).toBe(true);
    }
  }

  // The inverse is applied ONCE to the monthly grosz. Chaining it through the
  // typed amount would compound the rounding, so the check is that it inverts
  // the exact monthly figure, not that it round-trips a typed one.
  expect(fromMonthlyGrosz(606_667, 'hour', H40), 'back to an hourly rate').toBe(3_500);
  expect(fromMonthlyGrosz(433_333, 'week', H40)).toBe(100_000);
  expect(fromMonthlyGrosz(450_000, 'month', H40)).toBe(450_000);
  expect(fromMonthlyGrosz(750_000, 'year', H40)).toBe(9_000_000);

  // The range check moves with the solver onto the DERIVED monthly figure, and
  // the message names the maximum recomputed into the active unit, floored to
  // the grosz. §6's four figures, against the 1 000 000 zł monthly cap.
  const MAX = 100_000_000;
  expect(maxInUnitGrosz(MAX, 'year', H40)).toBe(1_200_000_000); // 12 000 000 zł
  expect(maxInUnitGrosz(MAX, 'month', H40)).toBe(100_000_000); //   1 000 000 zł
  expect(maxInUnitGrosz(MAX, 'week', H40)).toBe(23_076_923); //       230 769,23 zł
  expect(maxInUnitGrosz(MAX, 'hour', H40)).toBe(576_923); //            5 769,23 zł
  // And it is a real bound: one grosz more than the stated maximum converts to
  // more than a month may hold. `35 000 zł/godz.` never reaches the engine.
  for (const unit of UNITS) {
    const max = maxInUnitGrosz(MAX, unit, H40);
    expect(toMonthlyGrosz(max, unit, H40), `${unit}: the stated maximum`).toBeLessThanOrEqual(MAX);
    expect(toMonthlyGrosz(max + 1, unit, H40), `${unit}: one grosz over`).toBeGreaterThan(MAX);
  }
  expect(toMonthlyGrosz(3_500_000, 'hour', H40), '35 000 zł/h').toBeGreaterThan(MAX);

  // Hours: one decimal, comma or dot, carried in tenths. Empty, zero, a word
  // and more than a week's worth of hours are all the same case — rejected.
  expect(parseHours(DEFAULT_HOURS_PER_WEEK)).toEqual({ kind: 'ok', tenths: 400 });
  expect(parseHours('37,5')).toEqual({ kind: 'ok', tenths: 375 });
  expect(parseHours('37.5')).toEqual({ kind: 'ok', tenths: 375 });
  expect(parseHours('168')).toEqual({ kind: 'ok', tenths: 1_680 });
  for (const bad of ['', '   ', '0', '0,0', 'abc', '168,1', '169', '-5', '40,25']) {
    expect(parseHours(bad), `"${bad}" is not a number of hours`).toEqual({ kind: 'error' });
  }
});

// Criterion 4's last sentence, and the only instrument that can see it: a
// constant that is never rendered cannot be caught by a browser test, and one
// that IS rendered would be caught only on the screen that renders it. The
// calendar constants themselves are the exception the file exists to hold.
test('no hours-per-month constant exists anywhere in the source', () => {
  expect([WEEKS_PER_YEAR, MONTHS_PER_YEAR]).toEqual([52, 12]);

  // Shipped source only. A test file is not the source, and this one has to be
  // able to write `173,33` down in order to forbid it.
  const root = fileURLToPath(new URL('..', import.meta.url));
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) files.push(path);
    }
  };
  walk(root);
  expect(files.length, 'the walk found no source at all').toBeGreaterThan(10);

  // 173,33 and 173⅓ in every spelling a builder might reach for, plus 168 and
  // 160 as monthly hours, plus the name itself. `168` is legal as the hours in
  // a WEEK, which is why the pattern requires it next to a month.
  const forbidden = [
    /173[.,]?3/,
    /520\s*\/\s*3/,
    /\bhours?PerMonth\b/i,
    /\bmonthlyHours\b/i,
    /\bgodzinM(ie|)siecznie\b/i,
    /\b(168|160|176|173)\b[^\n]{0,20}\bmonth/i,
  ];
  for (const path of files) {
    const source = readFileSync(path, 'utf8');
    for (const pattern of forbidden) {
      expect(pattern.test(source), `${path} carries an hours-per-month constant: ${pattern}`).toBe(
        false,
      );
    }
  }
});
