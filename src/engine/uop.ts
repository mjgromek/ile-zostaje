import type { YearRates } from './rates';

export type LineKey = 'emerytalna' | 'rentowa' | 'chorobowa' | 'zdrowotna' | 'pit';

export type Line = {
  key: LineKey;
  /** Always positive. It is a deduction; the sign belongs to the display. */
  amountGrosz: number;
  /** The amount the rule was applied to, so the screen can teach the rule. */
  baseGrosz: number;
  ratePercent: number;
  /** What is left after this line. The last line's remainder is the net. */
  remainderGrosz: number;
};

export type UopResult = {
  grossGrosz: number;
  lines: Line[];
  netGrosz: number;
  under26: boolean;
  /** The PIT advance that would be due with the relief switched off. */
  pitWithoutReliefGrosz: number;
  /** What the relief is worth this month. Zero when it changes nothing. */
  reliefWorthGrosz: number;
};

const MONTHS_PER_YEAR = 12;

/**
 * Divide and round half up, on integers only. Everything in this module is
 * grosz, so no intermediate value is ever a fraction of a currency unit and no
 * result depends on binary floating point.
 */
function divRoundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

/**
 * `percent` of `amountGrosz`, rounded to the grosz. The rate is scaled to
 * hundredths of a percent first, which keeps both operands whole: 9,76% becomes
 * 976 / 10 000.
 */
function applyRate(amountGrosz: number, percent: number): number {
  return divRoundHalfUp(amountGrosz * Math.round(percent * 100), 10_000);
}

/** Ordynacja podatkowa rounds a tax base and a tax advance to full złote. */
function toWholeZloty(amountGrosz: number): number {
  return divRoundHalfUp(amountGrosz, 100) * 100;
}

/**
 * The monthly advance, and the base it was computed on. The screen shows that
 * base in the why-line, so it has to be the base the arithmetic actually used —
 * the one already rounded to full złote — or the row does not add up on paper.
 */
function pitAdvance(
  grossGrosz: number,
  zusGrosz: number,
  exemptGrosz: number,
  rates: YearRates,
): { amountGrosz: number; baseGrosz: number } {
  const { pit } = rates;
  const taxedIncome = grossGrosz - exemptGrosz;
  if (taxedIncome <= 0) return { amountGrosz: 0, baseGrosz: 0 };

  // Contributions attach to the income they were withheld from: the share that
  // sits under the relief is not deductible, so only the taxed proportion is.
  const deductibleZus =
    grossGrosz === 0 ? 0 : divRoundHalfUp(zusGrosz * taxedIncome, grossGrosz);
  const costs = Math.min(pit.deductibleCostsMonthlyGrosz.value, Math.max(0, taxedIncome - deductibleZus));
  const base = toWholeZloty(Math.max(0, taxedIncome - deductibleZus - costs));

  const monthlyThreshold = divRoundHalfUp(pit.thresholdAnnualGrosz.value, MONTHS_PER_YEAR);
  const firstBracket = Math.min(base, monthlyThreshold);
  const secondBracket = Math.max(0, base - monthlyThreshold);

  const tax =
    applyRate(firstBracket, pit.firstRatePercent.value) +
    applyRate(secondBracket, pit.secondRatePercent.value) -
    pit.taxReducingMonthlyGrosz.value;

  return { amountGrosz: toWholeZloty(Math.max(0, tax)), baseGrosz: base };
}

/**
 * The monthly breakdown of a gross salary on umowa o pracę.
 *
 * Assumes the one case slice one ships: a single employment relationship, the
 * standard koszty uzyskania przychodu, and a filed PIT-2 so the payer applies
 * the monthly kwota zmniejszająca.
 *
 * Every rate arrives in `rates`. There is no rate literal below this line.
 */
export function computeUop(grossGrosz: number, under26: boolean, rates: YearRates): UopResult {
  const gross = Math.max(0, Math.round(grossGrosz));
  const { contributions, youthRelief } = rates;

  const emerytalna = applyRate(gross, contributions.emerytalna.value);
  const rentowa = applyRate(gross, contributions.rentowa.value);
  const chorobowa = applyRate(gross, contributions.chorobowa.value);
  const zus = emerytalna + rentowa + chorobowa;

  // The health contribution is not 9% of the gross: ZUS is taken off first.
  const healthBase = gross - zus;
  const zdrowotna = applyRate(healthBase, contributions.zdrowotna.value);

  const monthlyReliefLimit = divRoundHalfUp(
    youthRelief.annualLimitGrosz.value,
    MONTHS_PER_YEAR,
  );
  const exempt = under26 ? Math.min(gross, monthlyReliefLimit) : 0;

  const pit = pitAdvance(gross, zus, exempt, rates);
  const pitWithoutRelief = under26 ? pitAdvance(gross, zus, 0, rates) : pit;

  const amounts: Array<[LineKey, number, number, number]> = [
    ['emerytalna', emerytalna, gross, contributions.emerytalna.value],
    ['rentowa', rentowa, gross, contributions.rentowa.value],
    ['chorobowa', chorobowa, gross, contributions.chorobowa.value],
    ['zdrowotna', zdrowotna, healthBase, contributions.zdrowotna.value],
    [
      'pit',
      pit.amountGrosz,
      under26 ? pitWithoutRelief.baseGrosz : pit.baseGrosz,
      rates.pit.firstRatePercent.value,
    ],
  ];

  let remainder = gross;
  const lines: Line[] = amounts.map(([key, amountGrosz, baseGrosz, ratePercent]) => {
    remainder -= amountGrosz;
    return { key, amountGrosz, baseGrosz: Math.max(0, baseGrosz), ratePercent, remainderGrosz: remainder };
  });

  // The net is what is left after the lines, by subtraction. That is what makes
  // the lines sum back to the gross exactly, at every amount.
  return {
    grossGrosz: gross,
    lines,
    netGrosz: remainder,
    under26,
    pitWithoutReliefGrosz: pitWithoutRelief.amountGrosz,
    reliefWorthGrosz: Math.max(0, pitWithoutRelief.amountGrosz - pit.amountGrosz),
  };
}
