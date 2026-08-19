import { describe, expect, it } from 'vitest';
import { computeContract, type Answers, type LineKey } from './contract';
import { RATES_2026 } from './rates-2026';
import type { ContractKind, YearRates } from './rates';

// Expected figures are hand-computed from the rates in src/engine/rates-2026.ts,
// each of which names the official page it was read off. The derivation is
// written out per case so a reader can check the arithmetic without running it.
//
// Shared rules, all from that file:
//   emerytalna 9,76% of gross      — ZUS, Finansowanie składek
//   rentowa     1,5% of gross      — ZUS, Finansowanie składek
//   chorobowa  2,45% of gross      — ZUS, Wysokość składek
//   zdrowotna     9% of (gross − the above) — ZUS, Wysokość składki zdrowotnej
//   PIT base   przychód − ZUS − KUP, to full złote
//   PIT        12% to 10 000 zł/month, 32% above, − 300 zł — podatki.gov.pl, skala + PIT-2
//   relief     przychód up to 85 528 zł/12 a month is exempt — podatki.gov.pl, Ulga dla młodych
//
// Per contract, all cited in rates-2026.ts:
//   umowa o pracę  KUP is the flat 250 zł/month quota — podatki.gov.pl, Dochody z pracy
//   zlecenie       emerytalna + rentowa + zdrowotna; chorobowa voluntary, modelled off;
//                  KUP 20% of (przychód − składki społeczne) — Dochody z umowy zlecenia
//                  lub o dzieło; a pupil or student under 26 pays nothing — ZUS, Umowy
//                  zlecenia i umowy o dzieło w ubezpieczeniach społecznych
//   dzieło         no ZUS and no zdrowotna; KUP 20%, or 50% with copyright transfer,
//                  capped at 120 000 zł a year — podatki.gov.pl, Dochody z praw autorskich

const answers = (contract: ContractKind, over: Partial<Answers> = {}): Answers => ({
  contract,
  under26: false,
  student: false,
  copyright: false,
  ...over,
});

type Case = {
  name: string;
  grossGrosz: number;
  answers: Answers;
  lines: Partial<Record<LineKey, number>>;
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
    name: 'etat: minimum wage, no relief',
    grossGrosz: 480_600,
    answers: answers('uop'),
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
    name: 'etat: six thousand, no relief',
    grossGrosz: 600_000,
    answers: answers('uop'),
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
    name: 'etat: twelve thousand, no relief, second bracket',
    grossGrosz: 1_200_000,
    answers: answers('uop'),
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
    name: 'etat: minimum wage, relief',
    grossGrosz: 480_600,
    answers: answers('uop', { under26: true }),
    lines: { emerytalna: 46_907, rentowa: 7_209, chorobowa: 11_775, zdrowotna: 37_324, pit: 0 },
    netGrosz: 377_385,
  },
  {
    // 6000,00 zł with the relief. net 600000 − 82260 − 46597 = 471143
    name: 'etat: six thousand, relief',
    grossGrosz: 600_000,
    answers: answers('uop', { under26: true }),
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
    name: 'etat: twelve thousand, relief above the monthly limit',
    grossGrosz: 1_200_000,
    answers: answers('uop', { under26: true }),
    lines: {
      emerytalna: 117_120,
      rentowa: 18_000,
      chorobowa: 29_400,
      zdrowotna: 93_193,
      pit: 17_500,
    },
    netGrosz: 924_787,
  },
  {
    // 4000,00 zł na zleceniu, 26 or over, not a student.
    // No chorobowa row at all: it is voluntary on a zlecenie (ZUS, Umowy
    // zlecenia i umowy o dzieło), and this app models it off.
    // emerytalna 400000 × 9,76% = 39040
    // rentowa    400000 × 1,5%  =  6000       → składki społeczne 45040
    // zdrowotna (400000 − 45040) × 9% = 31946,40 → 31946
    // KUP        20% × (400000 − 45040) = 70992
    // PIT base   400000 − 45040 − 70992 = 283968 → 2840 zł
    //            2840 zł × 12% = 340,80 zł − 300 zł = 40,80 zł → 41 zł
    // net        400000 − 39040 − 6000 − 31946 − 4100 = 318914
    name: 'zlecenie: four thousand, no relief, not a student',
    grossGrosz: 400_000,
    answers: answers('zlecenie'),
    lines: { emerytalna: 39_040, rentowa: 6_000, zdrowotna: 31_946, pit: 4_100 },
    netGrosz: 318_914,
  },
  {
    // The same zlecenie under 26: the relief covers umowa zlecenia (podatki.gov.pl,
    // Ulga dla młodych), the whole month is under the monthly share of the limit,
    // so PIT is 0. The contributions are unchanged — the relief is a tax relief.
    // net 400000 − 39040 − 6000 − 31946 = 323014
    name: 'zlecenie: four thousand, under 26, not a student',
    grossGrosz: 400_000,
    answers: answers('zlecenie', { under26: true }),
    lines: { emerytalna: 39_040, rentowa: 6_000, zdrowotna: 31_946, pit: 0 },
    netGrosz: 323_014,
  },
  {
    // A student under 26: ZUS does not cover them at all on a zlecenie, so the
    // five deduction rows collapse to one at 0 zł, and there is no zdrowotna.
    // KUP        20% × 400000 = 80000 (no contributions to subtract)
    // PIT        0 — the whole przychód is under the relief
    // net        400000
    name: 'zlecenie: four thousand, under 26 and a student',
    grossGrosz: 400_000,
    answers: answers('zlecenie', { under26: true, student: true }),
    lines: { zusOff: 0, pit: 0 },
    netGrosz: 400_000,
  },
  {
    // A student who is 26 or over pays in full: the exemption is stated for a
    // pupil or student who "nie skończył 26 lat", so it needs both answers.
    name: 'zlecenie: four thousand, a student but 26 or over',
    grossGrosz: 400_000,
    answers: answers('zlecenie', { student: true }),
    lines: { emerytalna: 39_040, rentowa: 6_000, zdrowotna: 31_946, pit: 4_100 },
    netGrosz: 318_914,
  },
  {
    // Umowa o dzieło: no ZUS and no zdrowotna, either compulsory or voluntary.
    // KUP        20% × 400000 = 80000
    // PIT base   400000 − 80000 = 320000 → 3200 zł
    //            3200 zł × 12% = 384 zł − 300 zł = 84 zł
    // net        400000 − 8400 = 391600
    name: 'dzieło: four thousand, 20% costs',
    grossGrosz: 400_000,
    answers: answers('dzielo'),
    lines: { pit: 8_400 },
    netGrosz: 391_600,
  },
  {
    // The same dzieło with copyright transferred: 50% costs.
    // KUP        50% × 400000 = 200000
    // PIT base   200000 → 2000 zł ; 2000 × 12% = 240 zł − 300 zł < 0 → 0
    // net        400000
    name: 'dzieło: four thousand, 50% costs with copyright transfer',
    grossGrosz: 400_000,
    answers: answers('dzielo', { copyright: true }),
    lines: { pit: 0 },
    netGrosz: 400_000,
  },
  {
    // 30 000 zł na dziele with copyright: 50% would be 15 000 zł of costs, but
    // the annual cap is 120 000 zł, one twelfth of which is 10 000 zł a month.
    // KUP        1000000 (capped, not 1500000)
    // PIT base   3000000 − 1000000 = 2000000 → 20 000 zł
    //            10 000 zł × 12% + 10 000 zł × 32% = 1200 + 3200 = 4400 zł
    //            4400 − 300 = 4100 zł
    // net        3000000 − 410000 = 2590000
    name: 'dzieło: thirty thousand, 50% costs against the annual cap',
    grossGrosz: 3_000_000,
    answers: answers('dzielo', { copyright: true }),
    lines: { pit: 410_000 },
    netGrosz: 2_590_000,
  },
  {
    // Under 26 on a dzieło: the relief's cited list does not include umowa o
    // dzieło, so the answer changes nothing. Identical to the 20% case above.
    name: 'dzieło: four thousand, under 26 — the relief does not reach it',
    grossGrosz: 400_000,
    answers: answers('dzielo', { under26: true }),
    lines: { pit: 8_400 },
    netGrosz: 391_600,
  },
];

describe('the monthly breakdown, 2026 rates', () => {
  it.each(cases)('$name', ({ grossGrosz, answers: given, lines, netGrosz }) => {
    const result = computeContract(grossGrosz, given, RATES_2026);
    const byKey = Object.fromEntries(result.lines.map((l) => [l.key, l.amountGrosz]));
    expect(byKey).toEqual(lines);
    expect(result.netGrosz).toBe(netGrosz);
  });

  // Criterion 1: umowa o pracę must still return what v0.1.0 returned. Every
  // figure below was produced by running `git show v0.1.0:src/engine/uop.ts`
  // against `git show v0.1.0:src/engine/rates-2026.ts`, not by rereading this
  // repository — the tagged release is the baseline, not a memory of it.
  it('umowa o pracę returns the figures tagged v0.1.0', () => {
    const baseline: Array<[number, boolean, Record<string, number>, number]> = [
      [480_600, false, { emerytalna: 46_907, rentowa: 7_209, chorobowa: 11_775, zdrowotna: 37_324, pit: 16_800 }, 360_585],
      [480_600, true, { emerytalna: 46_907, rentowa: 7_209, chorobowa: 11_775, zdrowotna: 37_324, pit: 0 }, 377_385],
      [600_000, false, { emerytalna: 58_560, rentowa: 9_000, chorobowa: 14_700, zdrowotna: 46_597, pit: 29_100 }, 442_043],
      [600_000, true, { emerytalna: 58_560, rentowa: 9_000, chorobowa: 14_700, zdrowotna: 46_597, pit: 0 }, 471_143],
      [1_200_000, false, { emerytalna: 117_120, rentowa: 18_000, chorobowa: 29_400, zdrowotna: 93_193, pit: 93_400 }, 848_887],
      [1_200_000, true, { emerytalna: 117_120, rentowa: 18_000, chorobowa: 29_400, zdrowotna: 93_193, pit: 17_500 }, 924_787],
      [333_333, false, { emerytalna: 32_533, rentowa: 5_000, chorobowa: 8_167, zdrowotna: 25_887, pit: 1_500 }, 260_246],
      [333_333, true, { emerytalna: 32_533, rentowa: 5_000, chorobowa: 8_167, zdrowotna: 25_887, pit: 0 }, 261_746],
      [100_000, false, { emerytalna: 9_760, rentowa: 1_500, chorobowa: 2_450, zdrowotna: 7_766, pit: 0 }, 78_524],
      [9_999_999, true, { emerytalna: 976_000, rentowa: 150_000, chorobowa: 245_000, zdrowotna: 776_610, pit: 2_326_500 }, 5_525_889],
    ];

    for (const [grossGrosz, under26, lines, netGrosz] of baseline) {
      const result = computeContract(grossGrosz, answers('uop', { under26 }), RATES_2026);
      const byKey = Object.fromEntries(result.lines.map((l) => [l.key, l.amountGrosz]));
      const id = `${grossGrosz}/${under26}`;
      expect({ id, lines: byKey, net: result.netGrosz }).toEqual({ id, lines, net: netGrosz });
    }
  });

  // Criterion 6: the deductions plus the net add up to the gross, to the grosz,
  // for every contract, with the student answer on and off, and at both costs
  // rates. A rounding bug shows up at some amounts and not others, so the whole
  // matrix is walked rather than one representative case.
  it('every deduction plus the net adds up to the gross exactly', () => {
    const amounts = [0, 1, 99, 100_000, 333_333, 400_000, 480_600, 600_000, 712_733, 1_200_000, 3_000_000, 9_999_999];
    const contracts: ContractKind[] = ['uop', 'zlecenie', 'dzielo'];
    for (const grossGrosz of amounts) {
      for (const contract of contracts) {
        for (const under26 of [false, true]) {
          for (const student of [false, true]) {
            for (const copyright of [false, true]) {
              const given = { contract, under26, student, copyright };
              const result = computeContract(grossGrosz, given, RATES_2026);
              const sum =
                result.netGrosz + result.lines.reduce((total, line) => total + line.amountGrosz, 0);
              const id = `${grossGrosz}/${contract}/${under26}/${student}/${copyright}`;
              expect(`${id}: ${sum}`).toBe(`${id}: ${grossGrosz}`);
            }
          }
        }
      }
    }
  });

  // Criterion 4: the relief follows the list the source prints, and the engine
  // reads that list. Take umowa zlecenia out of the data and the zlecenie net
  // must change; put umowa o dzieło in and the dzieło net must change. Neither
  // moves if the rule is hidden in an `if` on the contract name.
  it('applies the under-26 relief to exactly the contracts the data lists', () => {
    const given = (contract: ContractKind) => answers(contract, { under26: true });

    expect(RATES_2026.youthRelief.contracts.value).toEqual(['uop', 'zlecenie']);
    expect(computeContract(400_000, given('zlecenie'), RATES_2026).reliefCovers).toBe(true);
    expect(computeContract(400_000, given('dzielo'), RATES_2026).reliefCovers).toBe(false);

    const withoutZlecenie: YearRates = structuredClone(RATES_2026);
    withoutZlecenie.youthRelief.contracts.value = ['uop'];
    expect(computeContract(400_000, given('zlecenie'), withoutZlecenie).netGrosz).not.toBe(
      computeContract(400_000, given('zlecenie'), RATES_2026).netGrosz,
    );

    const withDzielo: YearRates = structuredClone(RATES_2026);
    withDzielo.youthRelief.contracts.value = ['uop', 'zlecenie', 'dzielo'];
    expect(computeContract(400_000, given('dzielo'), withDzielo).netGrosz).not.toBe(
      computeContract(400_000, given('dzielo'), RATES_2026).netGrosz,
    );
  });

  // Criterion 5 and P2-6: the 50% cap and the PIT threshold are both 120 000 zł
  // and are two different facts. Move one and the other must stay put — an
  // alias would drag both, and a future year that decouples them would be
  // silently wrong on the day it landed.
  it('reads the 50% costs cap from its own entry, never from the PIT threshold', () => {
    const { copyrightCostsAnnualCapGrosz } = RATES_2026.contracts.dzielo;
    expect(copyrightCostsAnnualCapGrosz.value).toBe(RATES_2026.pit.thresholdAnnualGrosz.value);
    expect(copyrightCostsAnnualCapGrosz.quote).not.toBe(RATES_2026.pit.thresholdAnnualGrosz.quote);

    const given = answers('dzielo', { copyright: true });
    const halved: YearRates = structuredClone(RATES_2026);
    halved.contracts.dzielo.copyrightCostsAnnualCapGrosz.value = 6_000_000;

    // The cap moved and the threshold did not: costs are capped lower, so the
    // net falls, and the PIT brackets are where they were.
    expect(halved.pit.thresholdAnnualGrosz.value).toBe(RATES_2026.pit.thresholdAnnualGrosz.value);
    expect(computeContract(3_000_000, given, halved).netGrosz).toBeLessThan(
      computeContract(3_000_000, given, RATES_2026).netGrosz,
    );
    expect(computeContract(3_000_000, given, RATES_2026).costsCapped).toBe(true);
    expect(computeContract(400_000, given, RATES_2026).costsCapped).toBe(false);
  });

  // Criterion 5: every rate comes from the year data file. Change one value
  // there and the net must move. If a rate were hard-coded in a branch, this
  // stays put.
  it('takes every rate from the year data file, not from a branch', () => {
    const uop = answers('uop');
    const baseline = computeContract(600_000, uop, RATES_2026);

    const mutated: YearRates = structuredClone(RATES_2026);
    mutated.contributions.emerytalna.value = 5;
    expect(computeContract(600_000, uop, mutated).netGrosz).not.toBe(baseline.netGrosz);

    const mutatedPit: YearRates = structuredClone(RATES_2026);
    mutatedPit.pit.firstRatePercent.value = 20;
    expect(computeContract(600_000, uop, mutatedPit).netGrosz).not.toBe(baseline.netGrosz);

    const mutatedRelief: YearRates = structuredClone(RATES_2026);
    mutatedRelief.youthRelief.annualLimitGrosz.value = 0;
    expect(computeContract(600_000, answers('uop', { under26: true }), mutatedRelief).netGrosz).not.toBe(
      computeContract(600_000, answers('uop', { under26: true }), RATES_2026).netGrosz,
    );

    // The per-contract entries are data too, not switches on a contract name.
    const zlecenie = answers('zlecenie');
    const mutatedCosts: YearRates = structuredClone(RATES_2026);
    mutatedCosts.contracts.zlecenie.costsPercent.value = 40;
    expect(computeContract(400_000, zlecenie, mutatedCosts).netGrosz).not.toBe(
      computeContract(400_000, zlecenie, RATES_2026).netGrosz,
    );

    const withChorobowa: YearRates = structuredClone(RATES_2026);
    withChorobowa.contracts.zlecenie.chorobowaVoluntary.value = false;
    expect(
      computeContract(400_000, zlecenie, withChorobowa).lines.map((line) => line.key),
    ).toContain('chorobowa');

    const student = answers('zlecenie', { under26: true, student: true });
    const withoutExemption: YearRates = structuredClone(RATES_2026);
    withoutExemption.contracts.zlecenie.studentUnder26Exempt.value = false;
    expect(computeContract(400_000, student, withoutExemption).netGrosz).not.toBe(
      computeContract(400_000, student, RATES_2026).netGrosz,
    );

    const insideZus: YearRates = structuredClone(RATES_2026);
    insideZus.contracts.dzielo.outsideZus.value = false;
    expect(computeContract(400_000, answers('dzielo'), insideZus).netGrosz).not.toBe(
      computeContract(400_000, answers('dzielo'), RATES_2026).netGrosz,
    );
  });

  // Found by looking at the rendered ladder: under the relief the PIT row shows
  // the base the relief REMOVED — slice 1's choice, so the reader sees what it
  // is worth — while the koszty came from the relieved computation and read
  // "20% kosztów (0,00 zł)" against a base of 4 260 zł. The two numbers in one
  // sentence have to come from the same arithmetic or the row cannot be checked
  // on paper.
  it('reports the koszty that belong to the base the ladder shows', () => {
    const zlecenie = answers('zlecenie', { under26: true });
    const result = computeContract(600_000, zlecenie, RATES_2026);
    const pitLine = result.lines.find((line) => line.key === 'pit');

    // 600 000 − 67 560 składek = 532 440 ; 20% of it = 106 488
    expect(result.costsGrosz).toBe(106_488);
    // and the base is that same subtraction, to full złote: 425 952 → 4 260 zł
    expect(pitLine?.baseGrosz).toBe(426_000);
    expect(600_000 - 67_560 - result.costsGrosz).toBe(425_952);
  });

  // The delta chip and the live region both quote this number, so it is the
  // engine's job and not the screen's. 769,86 zł on a 4 000 zł zlecenie is the
  // single biggest number this audience will see change.
  it('says what the student answer is worth, in either direction', () => {
    const on = computeContract(400_000, answers('zlecenie', { under26: true, student: true }), RATES_2026);
    const off = computeContract(400_000, answers('zlecenie', { under26: true }), RATES_2026);

    expect(on.zusExempt).toBe(true);
    expect(off.zusExempt).toBe(false);
    expect(on.netGrosz - off.netGrosz).toBe(76_986);
    expect(on.studentWorthGrosz).toBe(76_986);
    expect(off.studentWorthGrosz).toBe(76_986);

    // Where the question cannot change the result, it is worth nothing.
    expect(computeContract(400_000, answers('dzielo'), RATES_2026).studentWorthGrosz).toBe(0);
    expect(computeContract(400_000, answers('uop'), RATES_2026).studentWorthGrosz).toBe(0);
  });

  // P1-J. The same rule as the student answer, for the under-26 one: what the
  // answer is worth is the same month computed with the other answer, in EITHER
  // direction. Below the relief's monthly limit — 85 528 / 12 = 7 127,33 zł —
  // the relief cancels the whole advance and the two numbers coincide, which is
  // why the whole advance passed for the relief's worth for four cycles. Above
  // it only part of the przychód is exempt and they diverge: on uop at 12 000 zł
  // the advance is 934,00 and the relief is worth 759,00.
  it('says what the under-26 answer is worth, in either direction', () => {
    const worth = (contract: ContractKind, grossGrosz: number, under26: boolean) =>
      computeContract(grossGrosz, answers(contract, { under26 }), RATES_2026).reliefWorthGrosz;

    const cases: Array<[ContractKind, number, number]> = [
      // below the monthly limit: the relief is worth the whole advance
      ['uop', 600_000, 29_100],
      ['uop', 1_031_800, 73_800],
      ['zlecenie', 600_000, 21_100],
      ['zlecenie', 1_031_800, 57_900],
      // above it: the advance is bigger than the relief is worth
      ['uop', 1_200_000, 75_900],
      ['uop', 2_000_000, 196_800],
      ['zlecenie', 1_200_000, 60_700],
      ['zlecenie', 2_000_000, 144_600],
    ];

    for (const [contract, grossGrosz, expected] of cases) {
      const where = `${contract} ${grossGrosz / 100}`;
      expect(worth(contract, grossGrosz, true), `${where}, answered Tak`).toBe(expected);
      expect(worth(contract, grossGrosz, false), `${where}, answered Nie`).toBe(expected);
    }

    // Above the limit the whole advance is NOT what the relief is worth, and
    // the Nie side used to print it: 934,00 against 759,00 on uop at 12 000.
    const nie = computeContract(1_200_000, answers('uop'), RATES_2026);
    expect(nie.pitWithoutReliefGrosz).toBe(93_400);

    // Off the cited list the answer is worth nothing, in either direction.
    expect(worth('dzielo', 1_200_000, false)).toBe(0);
    expect(worth('dzielo', 1_200_000, true)).toBe(0);
  });
});
