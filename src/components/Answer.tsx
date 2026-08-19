import { useEffect, useRef, useState } from 'react';
import type { ContractResult } from '../engine/contract';
import { formatMoney, t, type Lang } from '../i18n/strings';
import type { Direction } from '../state/storage';
import type { Unit } from '../state/units';
import s from './Answer.module.css';

type Props = {
  lang: Lang;
  result: ContractResult | null;
  /** Which figure this block is the answer to. §3's copy table, and nothing
      else: the band, the ladder and the total row are direction-free. */
  direction: Direction;
  /** The unit the amount was typed in. The ANSWER is monthly in all four. */
  unit: Unit;
  /**
   * The same figure the numeral shows, expressed in the user's own unit, or
   * null at the month unit — where the answer already is the echo. Computed by
   * App from the monthly grosz, once, never chained through the typed amount.
   */
  perUnitGrosz: number | null;
  /**
   * §5.1's trigger set, computed once in App and closed: a contract or a
   * direction change and nothing else. It is a React key, so the subtree it
   * sits on is destroyed and recreated — which is why it sits INSIDE the
   * section and excludes the live region.
   */
  swapKey: string;
};

const DELTA_MS = 6_000;
const DELTA_MS_REDUCED = 10_000;

/**
 * The one figure the whole screen exists to show, plus the two permanent
 * statements. Those sit next to the number rather than in a footer, because
 * adjacency to the number is what makes permanent furniture actually read.
 */
type Delta = { key: string; amountGrosz: number };

export function Answer({ lang, result, direction, unit, perUnitGrosz, swapKey }: Props) {
  const [delta, setDelta] = useState<Delta | null>(null);
  const [live, setLive] = useState('');
  const announced = useRef<string | null>(null);
  const previousAnswers = useRef<{ under26: boolean; student: boolean } | null>(null);

  const under26 = result?.under26 ?? false;
  const student = result?.student ?? false;
  const netGrosz = result?.netGrosz ?? null;
  const grossGrosz = result?.grossGrosz ?? null;
  const reliefCovers = result?.reliefCovers ?? false;
  const reliefApplies = result?.reliefApplies ?? false;
  const reliefWorth = result?.reliefWorthGrosz ?? 0;
  const zusExempt = result?.zusExempt ?? false;
  const studentWorth = result?.studentWorthGrosz ?? 0;

  // An answer is announced immediately; typing is debounced, because
  // announcing every keystroke makes the field unusable.
  useEffect(() => {
    if (netGrosz === null) {
      setLive('');
      // P2-I: the last answered state must not outlive the result it described.
      // Left standing, the first keystroke of the next entry differs from it,
      // announces at once, and the rest debounce — one entry, two utterances.
      announced.current = null;
      return;
    }
    // Every answer, not just two of them. Spec §8 binds contract, student and
    // copyright to an immediate utterance; a key that names only under-26 and
    // student drops the other two into the typing debounce, silently. The
    // direction joins them: it is an answer, not a keystroke.
    // The unit joins them: choosing one is an answer, not a keystroke. The
    // hours are NOT here — that is a typed field and debounces with the amount.
    const state = `${result?.contract}/${under26}/${student}/${result?.copyright}/${direction}/${unit}`;
    const answered = announced.current !== null && announced.current !== state;
    announced.current = state;

    const extra = zusExempt
      ? ` ${t(lang, 'answer.live.delta.student', { amount: formatMoney(studentWorth, lang) })}`
      : reliefApplies && reliefWorth > 0
        ? ` ${t(lang, 'answer.live.delta', { amount: formatMoney(reliefWorth, lang) })}`
        : '';
    // A screen-reader user hears both figures the screen shows, in the order
    // the screen shows them: the monthly answer, then the echo in their unit.
    const echo =
      perUnitGrosz === null
        ? ''
        : ` ${t(lang, 'answer.live.perunit', {
            amount: formatMoney(perUnitGrosz, lang),
            per: t(lang, `unit.per.${unit}`),
          })}`;
    // The region says the figure the SCREEN says. Announcing the typed net
    // under the other direction's eyebrow is the P1-J shape App.tsx's own
    // comment says the sticky mini-bar was fixed for, surviving in the one
    // place a screen-reader user has no other channel. PRE-EXISTING at v0.4.0.
    const headline =
      direction === 'n2g' && grossGrosz !== null
        ? t(lang, 'answer.live.gross', { gross: formatMoney(grossGrosz, lang) })
        : t(lang, 'answer.live', { net: formatMoney(netGrosz, lang) });
    const sentence = headline + extra + echo;

    if (answered) {
      setLive(sentence);
      return;
    }
    const id = setTimeout(() => setLive(sentence), 500);
    return () => clearTimeout(id);
  }, [
    netGrosz,
    grossGrosz,
    result?.contract,
    under26,
    student,
    result?.copyright,
    reliefApplies,
    reliefWorth,
    zusExempt,
    studentWorth,
    direction,
    unit,
    perUnitGrosz,
    lang,
  ]);

  // The delta chip: what the answer was worth, shown for a few seconds and then
  // replaced by a quiet permanent line so the state stays legible. Two triggers
  // now, one mechanism — the student answer is the bigger of the two numbers.
  useEffect(() => {
    const previous = previousAnswers.current;
    if (netGrosz === null) {
      // P2-G: there is no screen to price, so the chip goes and the memory of
      // the last answers goes with it. Kept, they make the first result after
      // a clear look like a flip the user never made on a figure they can see.
      previousAnswers.current = null;
      setDelta(null);
      return;
    }
    previousAnswers.current = { under26, student };
    // Only a real change of an answer opens this moment. A first render, a
    // StrictMode second pass, or the first entry after a clear must not fire it.
    if (previous === null) return;

    let next: Delta | null = null;
    if (previous.student !== student && studentWorth > 0) {
      next = {
        key: student ? 'answer.delta.student.on' : 'answer.delta.student.off',
        amountGrosz: studentWorth,
      };
    } else if (previous.under26 !== under26 && reliefCovers) {
      // Only where the cited list covers this contract. Off the list the answer
      // is worth nothing and `reliefWorthGrosz` is zero, so no chip appears. The
      // engine gives the same figure on both sides of the flip; the whole PIT
      // advance is not it, above the relief's monthly limit.
      if (reliefWorth > 0) {
        next = {
          key: under26 ? 'answer.delta.on' : 'answer.delta.off',
          amountGrosz: reliefWorth,
        };
      }
    }
    // Anything else that moved the result — another contract, another amount —
    // leaves the standing chip pricing a screen that is no longer there, so it
    // goes. The timeout is only the last of the ways a chip ends, not the only
    // one.
    if (next === null) {
      setDelta(null);
      return;
    }

    setDelta(next);
    const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const id = setTimeout(() => setDelta(null), reduced ? DELTA_MS_REDUCED : DELTA_MS);
    return () => clearTimeout(id);
    // Every change of the result is examined; only a change of an answer opens
    // the moment, and every other one closes it. A language switch does not
    // recompute the result, so it leaves a truthful chip standing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <section className={s.answer} data-testid="answer">
      {/* The swap group. The furniture and the live region are deliberately
          OUTSIDE it: this is a changing React key, and a live region that is
          destroyed and recreated does not reliably announce the content it is
          created holding — silently, on exactly the gesture it exists for.
          The eyebrow is INSIDE, because its text changes with the direction and
          leaving it behind tears the block in two. */}
      <div className="swap" key={swapKey} data-testid="answer-swap">
        <p className={s.eyebrow}>
          {t(lang, direction === 'n2g' ? 'answer.eyebrow.gross' : 'answer.eyebrow')}
        </p>

        {result === null ? (
          // Direction-aware: a netto user must not be told to type a gross over
          // a field whose own label asks what they want in their account.
          <p className={s.empty}>
            {t(lang, direction === 'n2g' ? 'empty.answer.net' : 'empty.answer')}
          </p>
        ) : (
          <>
            {/* The figure is the answer to the question that was asked: what
                lands in the account, or what has to be on the contract for it
                to. Same computation, read from the other end. */}
            <p className={s.figure} aria-hidden="true" data-testid="net-amount">
              {formatMoney(direction === 'n2g' ? result.grossGrosz : result.netGrosz, lang)} zł
            </p>
            <p className={s.from}>
              {direction === 'n2g'
                ? t(lang, 'answer.from.net', { net: formatMoney(result.netGrosz, lang) })
                : t(lang, 'answer.from', { gross: formatMoney(result.grossGrosz, lang) })}
            </p>
            {/* The unit ends at the field's edge; this is the one place it
                reaches the answer, and it is secondary to the monthly figure.
                `≈` is doing real work — the division does not close exactly. */}
            {perUnitGrosz !== null ? (
              <p className={s.perUnit} data-testid="answer-perunit">
                {t(lang, direction === 'n2g' ? 'answer.perunit.gross' : 'answer.perunit', {
                  amount: formatMoney(perUnitGrosz, lang),
                  per: t(lang, `unit.per.${unit}`),
                })}
              </p>
            ) : null}
            {delta ? (
              <p className={s.delta} data-testid="delta-chip">
                {t(lang, delta.key, { amount: formatMoney(delta.amountGrosz, lang) })}
              </p>
            ) : null}
            {result.zusExempt ? (
              <p className={s.persistent}>{t(lang, 'answer.student.persistent')}</p>
            ) : null}
            {result.reliefApplies ? (
              <p className={s.persistent}>{t(lang, 'answer.relief.persistent')}</p>
            ) : null}
          </>
        )}
      </div>

      <div className={s.furniture}>
        <p>{t(lang, 'furniture.estimate')}</p>
        <p>{t(lang, 'furniture.storage')}</p>
      </div>

      {/* Named, because slice 3 puts a second role="status" on the page — the
          field's ambiguity slot — and a probe that takes the first one would
          silently measure the wrong region. */}
      <p
        className="visually-hidden"
        data-testid="live"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {live}
      </p>
    </section>
  );
}
