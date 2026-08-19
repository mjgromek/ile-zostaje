import { computeContract, type Answers } from './contract';
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

/**
 * How far either side of the crossing the exhaustive scan runs, in grosz.
 *
 * MEASURED with the shipped engine, not chosen: the net falls on 118 of 30 000
 * one-grosz steps of gross on uop, worst 1,00 zł, so the crossing bisection
 * finds can sit a few złote off the true lowest match; and a matching set spans
 * at most 129 grosz, with gaps inside it. 20 zł each way covers both by more
 * than an order of magnitude, and costs about 4 000 engine calls — seven
 * milliseconds, which is a keystroke's worth of work and no more.
 */
const WINDOW_GROSZ = 2_000;

/**
 * The reverse calculation: the lowest gross whose net is exactly the target.
 *
 * It has no formula of its own. Every value it compares comes from
 * `computeContract`, so the inverse cannot drift from the thing it inverts —
 * there is no second rate table, no closed form and no multiplier here, and a
 * change to the engine changes this answer with it.
 *
 * Bisection alone would be unsound, because net is not monotone in gross. So
 * bisection only LOCATES the crossing; the answer itself is decided by an
 * exhaustive one-grosz scan of a window around it, which is what makes the
 * lowest match, the bounds and the closest miss all mean what they say.
 */
export function solveGross(
  targetNetGrosz: number,
  answers: Answers,
  rates: YearRates,
  maxGrossGrosz: number,
): SolveResult {
  const netOf = (grossGrosz: number) => computeContract(grossGrosz, answers, rates).netGrosz;
  const target = Math.max(0, Math.round(targetNetGrosz));

  let low = 0;
  let high = maxGrossGrosz;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (netOf(middle) >= target) high = middle;
    else low = middle + 1;
  }

  const from = Math.max(0, low - WINDOW_GROSZ);
  const to = Math.min(maxGrossGrosz, low + WINDOW_GROSZ);

  let lowest = -1;
  let highest = -1;
  let closestGrosz = from;
  let closestDistance = Number.POSITIVE_INFINITY;
  for (let gross = from; gross <= to; gross++) {
    const net = netOf(gross);
    if (net === target) {
      if (lowest < 0) lowest = gross;
      highest = gross;
    }
    const distance = Math.abs(net - target);
    // Strictly nearer, so a tie keeps the lowest gross — the same rule the
    // exact answer follows, and the screen never has to explain two of them.
    if (distance < closestDistance) {
      closestDistance = distance;
      closestGrosz = gross;
    }
  }

  if (lowest < 0) return { kind: 'none', closestGrosz };
  return { kind: 'exact', grossGrosz: lowest, loGrosz: lowest, hiGrosz: highest };
}
