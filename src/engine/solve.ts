import type { Answers } from './contract';
import type { YearRates } from './rates';

/**
 * What gross produces a wanted net. The set of gross values matching a net is
 * not a single point and not always an interval, so the answer carries its
 * bounds: `grossGrosz` is the LOWEST match, `loGrosz`/`hiGrosz` are the ends of
 * the matching set, and they are equal exactly when the answer is unique.
 */
export type SolveResult =
  | { kind: 'exact'; grossGrosz: number; loGrosz: number; hiGrosz: number }
  | { kind: 'none'; closestGrosz: number };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function solveGross(
  _targetNetGrosz: number,
  _answers: Answers,
  _rates: YearRates,
  _maxGrossGrosz: number,
): SolveResult {
  return { kind: 'none', closestGrosz: 0 };
}
