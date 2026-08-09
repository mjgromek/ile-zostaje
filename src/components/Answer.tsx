import { useEffect, useRef, useState } from 'react';
import type { UopResult } from '../engine/uop';
import { formatMoney, t, type Lang } from '../i18n/strings';
import s from './Answer.module.css';

type Props = {
  lang: Lang;
  result: UopResult | null;
};

const DELTA_MS = 6_000;
const DELTA_MS_REDUCED = 10_000;

/**
 * The one figure the whole screen exists to show, plus the two permanent
 * statements. Those sit next to the number rather than in a footer, because
 * adjacency to the number is what makes permanent furniture actually read.
 */
export function Answer({ lang, result }: Props) {
  const [delta, setDelta] = useState<{ on: boolean; amountGrosz: number } | null>(null);
  const [live, setLive] = useState('');
  const announcedUnder26 = useRef<boolean | null>(null);
  const deltaUnder26 = useRef<boolean | null>(null);

  const under26 = result?.under26 ?? false;
  const netGrosz = result?.netGrosz ?? null;
  const reliefWorth = result?.reliefWorthGrosz ?? 0;
  const pitWithoutRelief = result?.pitWithoutReliefGrosz ?? 0;

  // The toggle is announced immediately; typing is debounced, because
  // announcing every keystroke makes the field unusable.
  useEffect(() => {
    if (netGrosz === null) {
      setLive('');
      return;
    }
    const toggled = announcedUnder26.current !== null && announcedUnder26.current !== under26;
    announcedUnder26.current = under26;

    const sentence =
      t(lang, 'answer.live', { net: formatMoney(netGrosz, lang) }) +
      (under26 && reliefWorth > 0
        ? ` ${t(lang, 'answer.live.delta', { amount: formatMoney(reliefWorth, lang) })}`
        : '');

    if (toggled) {
      setLive(sentence);
      return;
    }
    const id = setTimeout(() => setLive(sentence), 500);
    return () => clearTimeout(id);
  }, [netGrosz, under26, reliefWorth, lang]);

  // The delta chip: what the relief is worth, shown for a few seconds and then
  // replaced by a quiet permanent line so the state stays legible.
  useEffect(() => {
    const previous = deltaUnder26.current;
    deltaUnder26.current = under26;
    // Only a real change of the switch opens this moment. A first render, or a
    // StrictMode second pass, must not fire it.
    if (previous === null || previous === under26 || netGrosz === null) return;
    const amountGrosz = under26 ? reliefWorth : pitWithoutRelief;
    if (amountGrosz <= 0) return;
    setDelta({ on: under26, amountGrosz });
    const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const id = setTimeout(() => setDelta(null), reduced ? DELTA_MS_REDUCED : DELTA_MS);
    return () => clearTimeout(id);
    // Only a change of the switch opens this moment; typing must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [under26]);

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
              {t(lang, delta.on ? 'answer.delta.on' : 'answer.delta.off', {
                amount: formatMoney(delta.amountGrosz, lang),
              })}
            </p>
          ) : null}
          {result.under26 ? (
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
