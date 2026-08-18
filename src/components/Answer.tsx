import { useEffect, useRef, useState } from 'react';
import type { ContractResult } from '../engine/contract';
import { formatMoney, t, type Lang } from '../i18n/strings';
import s from './Answer.module.css';

type Props = {
  lang: Lang;
  result: ContractResult | null;
};

const DELTA_MS = 6_000;
const DELTA_MS_REDUCED = 10_000;

/**
 * The one figure the whole screen exists to show, plus the two permanent
 * statements. Those sit next to the number rather than in a footer, because
 * adjacency to the number is what makes permanent furniture actually read.
 */
type Delta = { key: string; amountGrosz: number };

export function Answer({ lang, result }: Props) {
  const [delta, setDelta] = useState<Delta | null>(null);
  const [live, setLive] = useState('');
  const announced = useRef<string | null>(null);
  const previousAnswers = useRef<{ under26: boolean; student: boolean } | null>(null);

  const under26 = result?.under26 ?? false;
  const student = result?.student ?? false;
  const netGrosz = result?.netGrosz ?? null;
  const reliefCovers = result?.reliefCovers ?? false;
  const reliefApplies = result?.reliefApplies ?? false;
  const reliefWorth = result?.reliefWorthGrosz ?? 0;
  const pitWithoutRelief = result?.pitWithoutReliefGrosz ?? 0;
  const zusExempt = result?.zusExempt ?? false;
  const studentWorth = result?.studentWorthGrosz ?? 0;

  // An answer is announced immediately; typing is debounced, because
  // announcing every keystroke makes the field unusable.
  useEffect(() => {
    if (netGrosz === null) {
      setLive('');
      return;
    }
    const state = `${under26}/${student}`;
    const answered = announced.current !== null && announced.current !== state;
    announced.current = state;

    const extra = zusExempt
      ? ` ${t(lang, 'answer.live.delta.student', { amount: formatMoney(studentWorth, lang) })}`
      : reliefApplies && reliefWorth > 0
        ? ` ${t(lang, 'answer.live.delta', { amount: formatMoney(reliefWorth, lang) })}`
        : '';
    const sentence = t(lang, 'answer.live', { net: formatMoney(netGrosz, lang) }) + extra;

    if (answered) {
      setLive(sentence);
      return;
    }
    const id = setTimeout(() => setLive(sentence), 500);
    return () => clearTimeout(id);
  }, [netGrosz, under26, student, reliefApplies, reliefWorth, zusExempt, studentWorth, lang]);

  // The delta chip: what the answer was worth, shown for a few seconds and then
  // replaced by a quiet permanent line so the state stays legible. Two triggers
  // now, one mechanism — the student answer is the bigger of the two numbers.
  useEffect(() => {
    const previous = previousAnswers.current;
    previousAnswers.current = { under26, student };
    // Only a real change of an answer opens this moment. A first render, or a
    // StrictMode second pass, must not fire it.
    if (previous === null || netGrosz === null) return;

    let next: Delta | null = null;
    if (previous.student !== student && studentWorth > 0) {
      next = {
        key: student ? 'answer.delta.student.on' : 'answer.delta.student.off',
        amountGrosz: studentWorth,
      };
    } else if (previous.under26 !== under26 && reliefCovers) {
      // Only where the cited list covers this contract. Off the list the answer
      // is worth nothing, and `pitWithoutReliefGrosz` is then the whole PIT
      // advance — a chip built from it would price a relief that never applied.
      const amountGrosz = under26 ? reliefWorth : pitWithoutRelief;
      if (amountGrosz > 0) {
        next = { key: under26 ? 'answer.delta.on' : 'answer.delta.off', amountGrosz };
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
      <p className={s.eyebrow}>{t(lang, 'answer.eyebrow')}</p>

      {result === null ? (
        <p className={s.empty}>{t(lang, 'empty.answer')}</p>
      ) : (
        <>
          <p className={s.figure} aria-hidden="true" data-testid="net-amount">
            {formatMoney(result.netGrosz, lang)} zł
          </p>
          <p className={s.from}>
            {t(lang, 'answer.from', { gross: formatMoney(result.grossGrosz, lang) })}
          </p>
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

      <div className={s.furniture}>
        <p>{t(lang, 'furniture.estimate')}</p>
        <p>{t(lang, 'furniture.storage')}</p>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </section>
  );
}
