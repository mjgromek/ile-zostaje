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
 * Koszty uzyskania przychodu, as the contract's own cited rule states them.
 * Umowa o pracę has a flat monthly quota; zlecenie and dzieło take a
 * percentage of the przychód after contributions, and the 50% rate carries an
 * annual ceiling. Nothing here is a literal: every number arrives from `rates`.
 */
type CostsRule = {
  flatGrosz: number | null;
  percent: number | null;
  monthlyCapGrosz: number;
};

function costsRule(answers: Answers, rates: YearRates): CostsRule {
  const { zlecenie, dzielo } = rates.contracts;
  if (answers.contract === 'uop') {
    return {
      flatGrosz: rates.pit.deductibleCostsMonthlyGrosz.value,
      percent: null,
      monthlyCapGrosz: Number.POSITIVE_INFINITY,
    };
  }
  if (answers.contract === 'zlecenie') {
    return {
      flatGrosz: null,
      percent: zlecenie.costsPercent.value,
      monthlyCapGrosz: Number.POSITIVE_INFINITY,
    };
  }
  if (!answers.copyright) {
    return {
      flatGrosz: null,
      percent: dzielo.costsPercent.value,
      monthlyCapGrosz: Number.POSITIVE_INFINITY,
    };
  }
  return {
    flatGrosz: null,
    percent: dzielo.copyrightCostsPercent.value,
    // The cap is stated per tax year; a month gets one twelfth of it, the same
    // way the PIT bracket and the relief limit are shared out.
    monthlyCapGrosz: divRoundHalfUp(
      dzielo.copyrightCostsAnnualCapGrosz.value,
      MONTHS_PER_YEAR,
    ),
  };
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
  costs: CostsRule,
  rates: YearRates,
): { amountGrosz: number; baseGrosz: number; costsGrosz: number; costsCapped: boolean } {
  const { pit } = rates;
  const taxedIncome = grossGrosz - exemptGrosz;
  if (taxedIncome <= 0) {
    return { amountGrosz: 0, baseGrosz: 0, costsGrosz: 0, costsCapped: false };
  }

  // Contributions attach to the income they were withheld from: the share that
  // sits under the relief is not deductible, so only the taxed proportion is.
  const deductibleZus =
    grossGrosz === 0 ? 0 : divRoundHalfUp(zusGrosz * taxedIncome, grossGrosz);
  // Both rules are computed on the przychód after contributions: the flat quota
  // is only bounded by it, the percentage is taken of it. Both pages say so.
  const costsBase = Math.max(0, taxedIncome - deductibleZus);
  const uncapped =
    costs.flatGrosz === null ? applyRate(costsBase, costs.percent ?? 0) : costs.flatGrosz;
  const applied = Math.min(uncapped, costsBase, costs.monthlyCapGrosz);
  const base = toWholeZloty(Math.max(0, taxedIncome - deductibleZus - applied));

  const monthlyThreshold = divRoundHalfUp(pit.thresholdAnnualGrosz.value, MONTHS_PER_YEAR);
  const firstBracket = Math.min(base, monthlyThreshold);
  const secondBracket = Math.max(0, base - monthlyThreshold);

  const tax =
    applyRate(firstBracket, pit.firstRatePercent.value) +
    applyRate(secondBracket, pit.secondRatePercent.value) -
    pit.taxReducingMonthlyGrosz.value;

  return {
    amountGrosz: toWholeZloty(Math.max(0, tax)),
    baseGrosz: base,
    costsGrosz: applied,
    costsCapped: applied === costs.monthlyCapGrosz && uncapped > costs.monthlyCapGrosz,
  };
}

type SocialKey = 'emerytalna' | 'rentowa' | 'chorobowa';

/**
 * Which contributions this contract carries, read off the cited rules. Three
 * absences, never mixed: a dzieło has no ZUS at all, a student under 26 on a
 * zlecenie has theirs removed, and chorobowa on a zlecenie is voluntary and
 * modelled off. The screen distinguishes them; the engine only says which
 * lines exist.
 */
function socialKeys(answers: Answers, rates: YearRates, zusExempt: boolean): SocialKey[] {
  const all: SocialKey[] = ['emerytalna', 'rentowa', 'chorobowa'];
  if (zusExempt) return [];
  if (answers.contract === 'dzielo') {
    return rates.contracts.dzielo.outsideZus.value ? [] : all;
  }
  if (answers.contract === 'zlecenie') {
    return rates.contracts.zlecenie.chorobowaVoluntary.value
      ? ['emerytalna', 'rentowa']
      : all;
  }
  return all;
}

/** A pupil or student under 26 is outside ZUS on a zlecenie. Both answers. */
function isZusExempt(answers: Answers, rates: YearRates): boolean {
  return (
    answers.contract === 'zlecenie' &&
    answers.under26 &&
    answers.student &&
    rates.contracts.zlecenie.studentUnder26Exempt.value
  );
}

function core(grossGrosz: number, answers: Answers, rates: YearRates) {
  const gross = Math.max(0, Math.round(grossGrosz));
  const { contributions, youthRelief } = rates;
  const { under26 } = answers;

  const zusExempt = isZusExempt(answers, rates);
  const social = socialKeys(answers, rates, zusExempt);
  const percentOf: Record<SocialKey, number> = {
    emerytalna: contributions.emerytalna.value,
    rentowa: contributions.rentowa.value,
    chorobowa: contributions.chorobowa.value,
  };
  const socialAmounts = social.map(
    (key) => [key, applyRate(gross, percentOf[key])] as const,
  );
  const zus = socialAmounts.reduce((total, [, amount]) => total + amount, 0);

  // The health contribution is not 9% of the gross: ZUS is taken off first.
  const healthBase = gross - zus;
  const healthApplies =
    !zusExempt &&
    !(answers.contract === 'dzielo' && rates.contracts.dzielo.outsideZus.value);
  const zdrowotna = healthApplies ? applyRate(healthBase, contributions.zdrowotna.value) : 0;

  const reliefCovers = youthRelief.contracts.value.includes(answers.contract);
  const reliefApplies = reliefCovers && under26;
  const monthlyReliefLimit = divRoundHalfUp(
    youthRelief.annualLimitGrosz.value,
    MONTHS_PER_YEAR,
  );
  const exempt = reliefApplies ? Math.min(gross, monthlyReliefLimit) : 0;

  const costs = costsRule(answers, rates);
  // Only the social contributions reduce the PIT base; zdrowotna has not been
  // deductible since 2022, which is why it is not in this sum.
  const pit = pitAdvance(gross, zus, exempt, costs, rates);
  const pitWithoutRelief = reliefApplies ? pitAdvance(gross, zus, 0, costs, rates) : pit;

  const amounts: Array<[LineKey, number, number, number]> = [
    ...socialAmounts.map(
      ([key, amount]) => [key, amount, gross, percentOf[key]] as [LineKey, number, number, number],
    ),
    ...(healthApplies
      ? ([['zdrowotna', zdrowotna, healthBase, contributions.zdrowotna.value]] as Array<
          [LineKey, number, number, number]
        >)
      : []),
    // One row at zero carrying the reason, never five zero rows and never a
    // silent absence: the rule is about who this person is, not about the
    // contract, so it is collapsed rather than omitted.
    ...(zusExempt
      ? ([['zusOff', 0, gross, 0]] as Array<[LineKey, number, number, number]>)
      : []),
    [
      'pit',
      pit.amountGrosz,
      reliefApplies ? pitWithoutRelief.baseGrosz : pit.baseGrosz,
      rates.pit.firstRatePercent.value,
    ],
  ];

  let remainder = gross;
  const lines: Line[] = amounts.map(([key, amountGrosz, baseGrosz, ratePercent]) => {
    remainder -= amountGrosz;
    return { key, amountGrosz, baseGrosz: Math.max(0, baseGrosz), ratePercent, remainderGrosz: remainder };
  });

  return {
    gross,
    lines,
    // The net is what is left after the lines, by subtraction. That is what
    // makes the lines sum back to the gross exactly, at every amount.
    netGrosz: remainder,
    reliefCovers,
    reliefApplies,
    zusExempt,
    pit,
    pitWithoutRelief,
    costsPercent: costs.percent,
  };
}

/**
 * The monthly breakdown of a gross amount, for one contract type.
 *
 * Assumes the cases slice one and two ship: one contract at a time, a filed
 * PIT-2 so the payer applies the monthly kwota zmniejszająca, and chorobowa
 * left off where it is voluntary.
 *
 * Every rate and every rule arrives in `rates`. There is no rate literal and no
 * contract name in a condition that decides an amount below this line.
 */
export function computeContract(
  grossGrosz: number,
  answers: Answers,
  rates: YearRates,
): ContractResult {
  const result = core(grossGrosz, answers, rates);

  // What the student answer is worth this month, in either direction: the same
  // month computed with the other answer. The delta chip and the live region
  // both quote it, so it is computed once, here, and not on the screen.
  const studentMatters = answers.contract === 'zlecenie' && answers.under26;
  const studentWorthGrosz = studentMatters
    ? Math.abs(
        core(grossGrosz, { ...answers, student: true }, rates).netGrosz -
          core(grossGrosz, { ...answers, student: false }, rates).netGrosz,
      )
    : 0;

  // What the under-26 answer is worth this month, in either direction, by the
  // same rule: the month in which the relief applies, computed once here. On the
  // Nie side the whole PIT advance is not the answer — above the relief's
  // monthly limit only part of the przychód is exempt, so the advance overstates
  // what the relief would be worth, by 175 zł on uop at 12 000 and without bound
  // above that.
  const reliefRun = result.reliefApplies
    ? result
    : result.reliefCovers
      ? core(grossGrosz, { ...answers, under26: true }, rates)
      : null;
  const reliefWorthGrosz =
    reliefRun === null
      ? 0
      : Math.max(0, reliefRun.pitWithoutRelief.amountGrosz - reliefRun.pit.amountGrosz);

  return {
    grossGrosz: result.gross,
    contract: answers.contract,
    lines: result.lines,
    netGrosz: result.netGrosz,
    under26: answers.under26,
    student: answers.student,
    copyright: answers.copyright,
    reliefCovers: result.reliefCovers,
    reliefApplies: result.reliefApplies,
    pitWithoutReliefGrosz: result.pitWithoutRelief.amountGrosz,
    reliefWorthGrosz,
    zusExempt: result.zusExempt,
    studentWorthGrosz,
    // The koszty that belong to the base the PIT row shows. Under the relief
    // that row shows the base the relief REMOVED — what it is worth teaches
    // more than a zero — so the koszty must come from the same computation, or
    // the sentence names two numbers from two different subtractions.
    costsGrosz: result.reliefApplies
      ? result.pitWithoutRelief.costsGrosz
      : result.pit.costsGrosz,
    costsPercent: result.costsPercent,
    costsCapped: result.pit.costsCapped,
  };
}
