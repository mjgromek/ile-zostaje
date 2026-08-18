import { useEffect, useMemo, useRef, useState } from 'react';
import { computeContract } from './engine/contract';
import { RATES_2026 } from './engine/rates-2026';
import type { ContractKind } from './engine/rates';
import { formatMoney, formatRate, t, type Lang } from './i18n/strings';
import { parseGross } from './state/gross';
import { loadEntries, saveEntries } from './state/storage';
import { Header } from './components/Header';
import { ContractBar } from './components/ContractBar';
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
  const [contract, setContract] = useState<ContractKind>(initial.contract);
  const [under26, setUnder26] = useState(initial.under26);
  const [student, setStudent] = useState(initial.student);
  const [copyright, setCopyright] = useState(initial.copyright);
  const [answerVisible, setAnswerVisible] = useState(true);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    saveEntries({ gross: grossText, contract, under26, student, copyright, lang });
  }, [grossText, contract, under26, student, copyright, lang]);

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
  const answers = useMemo(
    () => ({ contract, under26, student, copyright }),
    [contract, under26, student, copyright],
  );
  const result = useMemo(
    () => (parsed.kind === 'ok' ? computeContract(parsed.grosz, answers, rates) : null),
    [parsed, answers],
  );

  // What the current answers mean, on the card's last line. Each line is either
  // a rule of the contract or a number computed from this person's entry —
  // never a promise made before the fact.
  const consequences: string[] = [];
  if (contract === 'zlecenie') {
    consequences.push(t(lang, 'note.zlecenie.chorobowa'));
    if (result?.zusExempt) consequences.push(t(lang, 'note.zlecenie.student'));
  }
  if (contract === 'dzielo') {
    if (result && result.costsPercent !== null) {
      consequences.push(
        t(lang, 'note.dzielo.kup', {
          pct: formatRate(result.costsPercent, lang),
          amount: formatMoney(result.costsGrosz, lang),
        }),
      );
    }
    if (copyright) {
      consequences.push(
        t(lang, 'note.dzielo.kup.cap', {
          amount: formatMoney(rates.contracts.dzielo.copyrightCostsAnnualCapGrosz.value, lang),
        }),
        t(lang, 'note.dzielo.kup.condition'),
      );
    }
  }

  // Statement substitution: the answer is live, it changed nothing, and the
  // screen says why. Disabling the control would be a dead end the user cannot
  // interrogate; hiding it would make the app look as if it had ignored them.
  const substitution = result && under26 && !result.reliefCovers ? 'subst.relief.dzielo' : null;

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
        <ContractBar lang={lang} contract={contract} onContract={setContract} />

        <div className={css.columns}>
          <div className={css.left}>
            <GrossCard
              lang={lang}
              year={rates.year}
              contract={contract}
              grossText={grossText}
              parsed={parsed}
              under26={under26}
              student={student}
              copyright={copyright}
              consequences={consequences}
              minimumWageGrosz={rates.minimumWageMonthlyGrosz.value}
              onGrossText={setGrossText}
              onUnder26={setUnder26}
              onStudent={setStudent}
              onCopyright={setCopyright}
            />
          </div>

          <div className={css.right}>
            <div ref={answerRef}>
              <Answer lang={lang} result={result} />
            </div>
            <Band lang={lang} year={rates.year} result={result} />
            {substitution ? (
              <p className={css.note} data-testid="note-substitution">
                {t(lang, substitution)}
              </p>
            ) : null}
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
