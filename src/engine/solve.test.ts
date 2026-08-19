import { expect, test } from 'vitest';
import { computeContract, type Answers } from './contract';
import { RATES_2026 as rates } from './rates-2026';
import { solveGross } from './solve';
import { UNITS, fromMonthlyGrosz, toMonthlyGrosz } from '../state/units';

// Slice 3, criteria 3, 4 and 5. The reverse calculation is obtained from the
// SHIPPED engine and from nothing else, so the only honest check is the one
// that cannot be fooled by a shared mistake: an exhaustive one-grosz scan of
// `computeContract` itself, over a window per contract.
//
// Measured before the slice was written (orchestrator probe, 15:00): net is NOT
// monotone in gross — over gross 5 000–5 300 the net falls on 118 one-grosz
// steps on uop — so a bare bisection can land in a hole. And a matching set is
// not always contiguous: on uop it spans up to 129 grosz with gaps inside it,
// which is why `loGrosz`/`hiGrosz` are bounds and not a length.

const MAX_GROSZ = 100_000_000; // 1 000 000 zł, the input cap the field enforces

const answers = (
  contract: Answers['contract'],
  extra: Partial<Answers> = {},
): Answers => ({ contract, under26: false, student: false, copyright: false, ...extra });

const netOf = (grossGrosz: number, a: Answers) =>
  computeContract(grossGrosz, a, rates).netGrosz;

const solve = (targetNetGrosz: number, a: Answers) =>
  solveGross(targetNetGrosz, a, rates, MAX_GROSZ);

/** Every gross in [from, to] that produces each net. Exhaustive, one grosz. */
function scan(a: Answers, from: number, to: number): Map<number, number[]> {
  const byNet = new Map<number, number[]>();
  for (let gross = from; gross <= to; gross++) {
    const net = netOf(gross, a);
    const found = byNet.get(net);
    if (found) found.push(gross);
    else byNet.set(net, [gross]);
  }
  return byNet;
}

type Window = { name: string; a: Answers; from: number; to: number };

// One window per contract, plus the case the probe found to be exactly 1:1.
// Small on purpose: the scan is exhaustive and `npm test` has to stay fast.
const WINDOWS: Window[] = [
  { name: 'uop', a: answers('uop'), from: 620_000, to: 623_000 },
  { name: 'zlecenie', a: answers('zlecenie'), from: 780_000, to: 783_000 },
  {
    name: 'dzieło + prawa autorskie',
    a: answers('dzielo', { copyright: true }),
    from: 605_000,
    to: 608_000,
  },
  {
    name: 'student pod 26 na zleceniu',
    a: answers('zlecenie', { under26: true, student: true }),
    from: 600_000,
    to: 603_000,
  },
];

// A matching set can reach outside the window, and then the scan is not the
// authority on its bounds. Only nets whose whole set sits this far inside the
// window are compared.
const EDGE_GROSZ = 1_000;

test('the solver agrees with an exhaustive one-grosz scan: lowest match, and both bounds', () => {
  for (const { name, a, from, to } of WINDOWS) {
    const byNet = scan(a, from, to);
    const eligible = [...byNet.entries()].filter(
      ([, grosses]) =>
        grosses[0]! >= from + EDGE_GROSZ && grosses[grosses.length - 1]! <= to - EDGE_GROSZ,
    );
    expect(eligible.length, `${name}: nothing to compare`).toBeGreaterThan(100);

    // Every 25th net across the window, deterministically — a solve costs about
    // four thousand engine calls, so the sampling is what keeps this a second.
    const checked: number[] = [];
    for (let i = 0; i < eligible.length; i += 25) {
      const [net, grosses] = eligible[i]!;
      const where = `${name}: net ${net}`;
      const answer = solve(net, a);
      expect(answer.kind, where).toBe('exact');
      if (answer.kind !== 'exact') continue;
      expect(answer.grossGrosz, `${where}: lowest gross`).toBe(grosses[0]);
      expect(answer.loGrosz, `${where}: lo`).toBe(grosses[0]);
      expect(answer.hiGrosz, `${where}: hi`).toBe(grosses[grosses.length - 1]);
      checked.push(net);
    }
    expect(checked.length, `${name}: too few nets compared`).toBeGreaterThan(20);
  }
});

// Criterion 4's table, straddling every threshold the probe measured: the
// relief's monthly limit at 7 127,33, each contract's own 32% crossing, and the
// 50% KUP monthly cap at 20 001.
const BOTH = [false, true];

function roundTripCases(): { gross: number; a: Answers }[] {
  const cases: { gross: number; a: Answers }[] = [];
  for (const contract of ['uop', 'zlecenie'] as const) {
    for (const under26 of BOTH) {
      for (const gross of [600_000, 1_200_000, 2_000_000, 712_700, 712_733, 712_800]) {
        cases.push({ gross, a: answers(contract, { under26 }) });
      }
    }
  }
  // One below and one above each contract's own 32% crossing.
  cases.push({ gross: 1_100_000, a: answers('uop') });
  cases.push({ gross: 1_500_000, a: answers('uop') });
  cases.push({ gross: 1_300_000, a: answers('zlecenie') });
  cases.push({ gross: 1_600_000, a: answers('zlecenie') });
  cases.push({ gross: 1_200_000, a: answers('dzielo') });
  cases.push({ gross: 1_400_000, a: answers('dzielo') });
  // The 50% KUP monthly cap, and the grosz on either side of it.
  for (const gross of [1_500_000, 2_500_000, 2_000_000, 2_000_100]) {
    cases.push({ gross, a: answers('dzielo', { copyright: true }) });
  }
  // Every combination of contract × under26 × student × copyright, twice.
  for (const contract of ['uop', 'zlecenie', 'dzielo'] as const) {
    for (const under26 of BOTH) {
      for (const student of BOTH) {
        for (const copyright of BOTH) {
          for (const gross of [600_000, 2_000_000]) {
            cases.push({ gross, a: answers(contract, { under26, student, copyright }) });
          }
        }
      }
    }
  }
  return cases;
}

test('the round trip closes to the grosz on both sides of every threshold', () => {
  for (const { gross, a } of roundTripCases()) {
    const net = netOf(gross, a);
    const where = `${a.contract} u26=${a.under26} st=${a.student} cr=${a.copyright} @ ${gross}`;
    const answer = solve(net, a);
    expect(answer.kind, where).toBe('exact');
    if (answer.kind !== 'exact') continue;
    // Exactly the entered net, not within a grosz of it.
    expect(netOf(answer.grossGrosz, a), `${where}: net of the solved gross`).toBe(net);
    // The lowest match, so never above the gross that produced the net.
    expect(answer.grossGrosz, `${where}: not the lowest`).toBeLessThanOrEqual(gross);
    expect(answer.loGrosz, `${where}: lo is the answer`).toBe(answer.grossGrosz);
    expect(answer.hiGrosz, `${where}: hi below lo`).toBeGreaterThanOrEqual(answer.loGrosz);
    expect(netOf(answer.hiGrosz, a), `${where}: hi is not a match`).toBe(net);
  }
});

test('above the top reachable net there is no exact gross, and the closest is the cap', () => {
  for (const a of [
    answers('uop'),
    answers('zlecenie'),
    answers('dzielo', { copyright: true }),
  ]) {
    const top = netOf(MAX_GROSZ, a);
    const where = `${a.contract}: top net ${top}`;

    // The top itself is reachable, by the gross that produced it.
    const reachable = solve(top, a);
    expect(reachable.kind, `${where} is itself reachable`).toBe('exact');

    // One grosz above it, and a long way above it, are not.
    for (const target of [top + 1, top + 100_000]) {
      const answer = solve(target, a);
      expect(answer.kind, `${where}, target ${target}`).toBe('none');
      if (answer.kind !== 'none') continue;
      expect(answer.closestGrosz, `${where}: closest gross`).toBe(MAX_GROSZ);
    }
  }
});

// Slice 4, criterion 7. The reverse solve now runs on the DERIVED monthly
// figure, so two things have to hold that did not have to hold before: the unit
// conversion has to be a true round trip at the amounts the field can produce,
// and the solver has to stay sound across the new ZUS ceiling, whose crossing
// at 23 550,00 zł a month changes the net function's SLOPE inside the range the
// year unit makes ordinary.
//
// The monthly amounts below are multiples of 5,20 zł. That is not decoration:
// a month is exactly representable in all four units only when it is, because
// the week conversion is ×52 ÷ 12 and the hour conversion at 40 h/week is
// ×3 ÷ 520. Picking round-looking figures instead would test the rounding, not
// the round trip, and would have hidden the solver behind it.
const H40 = 400;
const CEILING_MONTHLY = 2_355_000;

test('the round trip closes to the grosz in every unit, on both sides of the ZUS ceiling', () => {
  const monthlies = [
    600_080, // 6 000,80 zł
    2_000_440, // 20 004,40 zł
    CEILING_MONTHLY - 520, // one step below the ceiling's crossing
    CEILING_MONTHLY, // at it
    CEILING_MONTHLY + 520, // and above it, where the slope changed
  ];

  for (const contract of ['uop', 'zlecenie', 'dzielo'] as const) {
    for (const monthly of monthlies) {
      for (const unit of UNITS) {
        const typed = fromMonthlyGrosz(monthly, unit, H40);
        const where = `${contract} ${monthly} as ${unit} (${typed})`;
        // The unit is a lossless carrier at these amounts, so anything that
        // fails below is the engine or the solver and never the conversion.
        expect(toMonthlyGrosz(typed, unit, H40), `${where}: not a round trip`).toBe(monthly);

        const a = answers(contract);
        const net = netOf(monthly, a);
        const answer = solve(net, a);
        expect(answer.kind, where).toBe('exact');
        if (answer.kind !== 'exact') continue;
        // Exactly the net, not within a grosz of it — the criterion's own words.
        expect(netOf(answer.grossGrosz, a), `${where}: compute(solve(net)) !== net`).toBe(net);
        expect(answer.grossGrosz, `${where}: not the lowest`).toBeLessThanOrEqual(monthly);
      }
    }
  }
});
