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

const LINE_ORDER: LineKey[] = ['emerytalna', 'rentowa', 'chorobowa', 'zdrowotna', 'pit'];

// Stub. Returns a shaped-but-empty breakdown so the first run fails on the
// numbers rather than on a missing module.
export function computeUop(
  grossGrosz: number,
  under26: boolean,
  _rates: YearRates,
): UopResult {
  return {
    grossGrosz,
    lines: LINE_ORDER.map((key) => ({
      key,
      amountGrosz: 0,
      baseGrosz: 0,
      ratePercent: 0,
      remainderGrosz: grossGrosz,
    })),
    netGrosz: grossGrosz,
    under26,
    pitWithoutReliefGrosz: 0,
    reliefWorthGrosz: 0,
  };
}
