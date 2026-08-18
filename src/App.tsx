import { useEffect, useMemo, useRef, useState } from 'react';
import { computeContract } from './engine/contract';
import { RATES_2026 } from './engine/rates-2026';
import { formatMoney, t, type Lang } from './i18n/strings';
import { parseGross } from './state/gross';
import { loadEntries, saveEntries } from './state/storage';
import { Header } from './components/Header';
import { GrossCard } from './components/GrossCard';
import { Answer } from './components/Answer';
import { Band } from './components/Band';
import { Ladder } from './components/Ladder';
import { Sources } from './components/Sources';
import css from './App.module.css';

const rates = RATES_2026;

export function App() {
  const initial = useRef(loadEntries()).current;
  const [lang, setLang] = useState<Lang>(initial.lang);
  const [grossText, setGrossText] = useState(initial.gross);
  const [under26, setUnder26] = useState(initial.under26);
  const [answerVisible, setAnswerVisible] = useState(true);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    saveEntries({ gross: grossText, under26, lang });
  }, [grossText, under26, lang]);

  // The sticky mini-bar guarantees the net at any scroll on any device height,
  // which fold placement alone cannot: at 320x568 the figure lands below it.
  useEffect(() => {
    const node = answerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setAnswerVisible(entry?.isIntersecting ?? true),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const parsed = useMemo(() => parseGross(grossText), [grossText]);
  const result = useMemo(
    () => (parsed.kind === 'ok' ? computeContract(parsed.grosz, { contract: 'uop', under26, student: false, copyright: false }, rates) : null),
    [parsed, under26],
  );

  return (
    <>
      {result && !answerVisible ? (
        <div className={css.sticky} data-testid="sticky-net">
          <span>{t(lang, 'answer.eyebrow')}</span>
          <span aria-hidden="true">·</span>
          <span className={css.stickyAmount}>{formatMoney(result.netGrosz, lang)} zł</span>
        </div>
      ) : null}

      <div className={css.page}>
        <Header lang={lang} year={rates.year} onLang={setLang} />
        <p className={css.lede}>{t(lang, 'app.lede')}</p>

        <div className={css.columns}>
          <div className={css.left}>
            <GrossCard
              lang={lang}
              year={rates.year}
              grossText={grossText}
              parsed={parsed}
              under26={under26}
              minimumWageGrosz={rates.minimumWageMonthlyGrosz.value}
              onGrossText={setGrossText}
              onUnder26={setUnder26}
            />
          </div>

          <div className={css.right}>
            <div ref={answerRef}>
              <Answer lang={lang} result={result} />
            </div>
            <Band lang={lang} year={rates.year} result={result} />
            <Ladder lang={lang} result={result} rates={rates} />
          </div>

          {/* Last on a phone, under the card on a desktop: provenance sits
              beside the inputs where there is room, and never above the answer. */}
          <div className={css.provenance}>
            <Sources lang={lang} rates={rates} />
          </div>
        </div>
      </div>
    </>
  );
}
