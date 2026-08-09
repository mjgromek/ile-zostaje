import { describe, expect, it } from 'vitest';
import { computeUop, type LineKey } from './uop';
import { RATES_2026 } from './rates-2026';
import type { YearRates } from './rates';

// Expected figures are hand-computed from the rates in src/engine/rates-2026.ts,
// each of which names the official page it was read off. The derivation is
// written out per case so a reader can check the arithmetic without running it.
//
// Shared rules, all from that file:
//   emerytalna 9,76% of gross      — ZUS, Finansowanie składek
//   rentowa     1,5% of gross      — ZUS, Finansowanie składek
//   chorobowa  2,45% of gross      — ZUS, Wysokość składek
//   zdrowotna     9% of (gross − the three above) — ZUS, Wysokość składki zdrowotnej
//                                    and ZUS, Podstawa wymiaru składek zdrowotnych
//   PIT base   gross − ZUS − 250 zł KUP, to full złote — podatki.gov.pl, Dochody z pracy
//   PIT        12% to 10 000 zł/month, 32% above, − 300 zł — podatki.gov.pl, skala + PIT-2
//   relief     przychód up to 85 528 zł/12 a month is exempt — podatki.gov.pl, Ulga dla młodych

type Case = {
  name: string;
  grossGrosz: number;
  under26: boolean;
  lines: Record<LineKey, number>;
  netGrosz: number;
};

const cases: Case[] = [
  {
    // 4806,00 zł — minimalne wynagrodzenie 2026 (gov.pl/web/rodzina).
    // emerytalna 480600 × 9,76%   = 46906,56 → 46907
    // rentowa    480600 × 1,5%    =  7209,00 →  7209
    // chorobowa  480600 × 2,45%   = 11774,70 → 11775
    // zdrowotna (480600 − 65891) × 9% = 37323,81 → 37324
    // PIT base   480600 − 65891 − 25000 = 389709 → 3897 zł
    //            3897 zł × 12% = 467,64 zł − 300 zł = 167,64 zł → 168 zł
    // net        480600 − 46907 − 7209 − 11775 − 37324 − 16800 = 360585
    name: 'minimum wage, no relief',
    grossGrosz: 480_600,
    under26: false,
    lines: { emerytalna: 46_907, rentowa: 7_209, chorobowa: 11_775, zdrowotna: 37_324, pit: 16_800 },
    netGrosz: 360_585,
  },
  {
    // 6000,00 zł
    // emerytalna 58560, rentowa 9000, chorobowa 14700 → ZUS 82260
    // zdrowotna (600000 − 82260) × 9% = 46596,60 → 46597
    // PIT base   600000 − 82260 − 25000 = 492740 → 4927 zł
    //            4927 zł × 12% = 591,24 zł − 300 zł = 291,24 zł → 291 zł
    // net        600000 − 82260 − 46597 − 29100 = 442043
    name: 'six thousand, no relief',
    grossGrosz: 600_000,
    under26: false,
    lines: { emerytalna: 58_560, rentowa: 9_000, chorobowa: 14_700, zdrowotna: 46_597, pit: 29_100 },
    netGrosz: 442_043,
  },
  {
    // 12000,00 zł — crosses the second bracket: a monthly base above
    // 120 000 zł / 12 = 10 000 zł is taxed at 32%.
    // emerytalna 117120, rentowa 18000, chorobowa 29400 → ZUS 164520
    // zdrowotna (1200000 − 164520) × 9% = 93193,20 → 93193
    // PIT base   1200000 − 164520 − 25000 = 1010480 → 10105 zł
    //            10000 zł × 12% + 105 zł × 32% = 1200 + 33,60 = 1233,60 zł
    //            1233,60 − 300 = 933,60 zł → 934 zł
    // net        1200000 − 164520 − 93193 − 93400 = 848887
    name: 'twelve thousand, no relief, second bracket',
    grossGrosz: 1_200_000,
    under26: false,
    lines: {
      emerytalna: 117_120,
      rentowa: 18_000,
      chorobowa: 29_400,
      zdrowotna: 93_193,
      pit: 93_400,
    },
    netGrosz: 848_887,
  },
  {
    // 4806,00 zł with the under-26 relief: the whole month is under the
    // 85 528 zł / 12 = 7127,33 zł monthly share, so PIT is 0.
    // net 480600 − 46907 − 7209 − 11775 − 37324 = 377385
    name: 'minimum wage, relief',
    grossGrosz: 480_600,
    under26: true,
    lines: { emerytalna: 46_907, rentowa: 7_209, chorobowa: 11_775, zdrowotna: 37_324, pit: 0 },
    netGrosz: 377_385,
  },
  {
    // 6000,00 zł with the relief. net 600000 − 82260 − 46597 = 471143
    name: 'six thousand, relief',
    grossGrosz: 600_000,
    under26: true,
    lines: { emerytalna: 58_560, rentowa: 9_000, chorobowa: 14_700, zdrowotna: 46_597, pit: 0 },
    netGrosz: 471_143,
  },
  {
    // 12000,00 zł with the relief — above the monthly share of the limit, so
    // only part of the month is exempt and PIT is not zero.
    // exempt     712733 ; taxed przychód 1200000 − 712733 = 487267
    // ZUS attributable to the taxed part: 164520 × 487267 / 1200000 = 66804,31 → 66804
    // PIT base   487267 − 66804 − 25000 = 395463 → 3955 zł
    //            3955 zł × 12% = 474,60 zł − 300 zł = 174,60 zł → 175 zł
    // net        1200000 − 164520 − 93193 − 17500 = 924787
    name: 'twelve thousand, relief above the monthly limit',
    grossGrosz: 1_200_000,
    under26: true,
    lines: {
      emerytalna: 117_120,
      rentowa: 18_000,
      chorobowa: 29_400,
      zdrowotna: 93_193,
      pit: 17_500,
    },
    netGrosz: 924_787,
  },
];

describe('umowa o pracę, monthly, 2026 rates', () => {
  it.each(cases)('$name', ({ grossGrosz, under26, lines, netGrosz }) => {
    const result = computeUop(grossGrosz, under26, RATES_2026);
    const byKey = Object.fromEntries(result.lines.map((l) => [l.key, l.amountGrosz]));
    expect(byKey).toEqual(lines);
    expect(result.netGrosz).toBe(netGrosz);
  });

  // Acceptance criterion 2: the deductions plus the net add up to the gross, to
  // the grosz. Checked across a spread of amounts and both relief states, since
  // a rounding bug shows up at some amounts and not others.
  it('every deduction plus the net adds up to the gross exactly', () => {
    const amounts = [0, 1, 99, 100_000, 333_333, 480_600, 600_000, 712_733, 1_200_000, 9_999_999];
    for (const grossGrosz of amounts) {
      for (const under26 of [false, true]) {
        const result = computeUop(grossGrosz, under26, RATES_2026);
        const sum =
          result.netGrosz + result.lines.reduce((total, line) => total + line.amountGrosz, 0);
        expect(`${grossGrosz}/${under26}: ${sum}`).toBe(`${grossGrosz}/${under26}: ${grossGrosz}`);
      }
    }
  });

  // Acceptance criterion 4: every rate comes from the year data file. Change one
  // value there and the net must move. If a rate were hard-coded in a branch,
  // this stays put.
  it('takes every rate from the year data file, not from a branch', () => {
    const baseline = computeUop(600_000, false, RATES_2026);

    const mutated: YearRates = structuredClone(RATES_2026);
    mutated.contributions.emerytalna.value = 5;
    expect(computeUop(600_000, false, mutated).netGrosz).not.toBe(baseline.netGrosz);

    const mutatedPit: YearRates = structuredClone(RATES_2026);
    mutatedPit.pit.firstRatePercent.value = 20;
    expect(computeUop(600_000, false, mutatedPit).netGrosz).not.toBe(baseline.netGrosz);

    const mutatedRelief: YearRates = structuredClone(RATES_2026);
    mutatedRelief.youthRelief.annualLimitGrosz.value = 0;
    expect(computeUop(600_000, true, mutatedRelief).netGrosz).not.toBe(
      computeUop(600_000, true, RATES_2026).netGrosz,
    );
  });
});
