import type { ContractKind, YearRates } from './rates';

export type LineKey =
  | 'emerytalna'
  | 'rentowa'
  | 'chorobowa'
  | 'zdrowotna'
  /** The one row that replaces the ZUS lines a student under 26 does not pay. */
  | 'zusOff'
  | 'pit';

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

/** Everything the person answered. One shape for all three contracts. */
export type Answers = {
  contract: ContractKind;
  under26: boolean;
  student: boolean;
  /** Transfer of copyright, which is what earns the higher costs rate. */
  copyright: boolean;
};

export type ContractResult = {
  grossGrosz: number;
  contract: ContractKind;
  lines: Line[];
  netGrosz: number;
  under26: boolean;
  student: boolean;
  copyright: boolean;
  /** True when the cited relief list covers this contract, whatever the age. */
  reliefCovers: boolean;
  /** True when it covers this contract AND this person is under 26. */
  reliefApplies: boolean;
  /** The PIT advance that would be due with the relief switched off. */
  pitWithoutReliefGrosz: number;
  /** What the relief is worth this month. Zero when it changes nothing. */
  reliefWorthGrosz: number;
  /** True when the student answer removed every contribution. */
  zusExempt: boolean;
  /** What the student answer is worth this month, in either direction. */
  studentWorthGrosz: number;
  /** Koszty uzyskania przychodu applied to this month. */
  costsGrosz: number;
  /** The percentage they were computed at, or null for the flat uop quota. */
  costsPercent: number | null;
  /** True when the annual cap on 50% costs bit this month. */
  costsCapped: boolean;
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
): { amountGrosz: number; baseGrosz: number; costsGrosz: number } {
  const { pit } = rates;
  const taxedIncome = grossGrosz - exemptGrosz;
  if (taxedIncome <= 0) return { amountGrosz: 0, baseGrosz: 0, costsGrosz: 0 };

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

  return { amountGrosz: toWholeZloty(Math.max(0, tax)), baseGrosz: base, costsGrosz: costs };
}

/**
 * The monthly breakdown of a gross amount, for one contract type.
 *
 * NOT IMPLEMENTED YET for zlecenie and dzieło: every contract is still computed
 * as umowa o pracę, no student exemption, no percentage costs, and the relief
 * list is not consulted. The cases in contract.test.ts fail against this stub
 * on the numbers, which is where the next commit starts.
 *
 * Every rate arrives in `rates`. There is no rate literal below this line.
 */
export function computeContract(
  grossGrosz: number,
  answers: Answers,
  rates: YearRates,
): ContractResult {
  const gross = Math.max(0, Math.round(grossGrosz));
  const { contributions, youthRelief } = rates;
  const { contract, under26, student, copyright } = answers;

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
    contract,
    lines,
    netGrosz: remainder,
    under26,
    student,
    copyright,
    reliefCovers: true,
    reliefApplies: under26,
    pitWithoutReliefGrosz: pitWithoutRelief.amountGrosz,
    reliefWorthGrosz: Math.max(0, pitWithoutRelief.amountGrosz - pit.amountGrosz),
    zusExempt: false,
    studentWorthGrosz: 0,
    costsGrosz: pit.costsGrosz,
    costsPercent: null,
    costsCapped: false,
  };
}
