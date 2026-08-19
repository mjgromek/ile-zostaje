import { useEffect, useMemo, useRef, useState } from 'react';
import { computeContract } from './engine/contract';
import { solveGross } from './engine/solve';
import { RATES_2026 } from './engine/rates-2026';
import type { ContractKind } from './engine/rates';
import { formatMoney, formatRate, t, type Lang } from './i18n/strings';
import { MAX_GROSS_GROSZ, parseGross } from './state/gross';
import { loadEntries, saveEntries, type Direction } from './state/storage';
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
  const [direction, setDirection] = useState<Direction>(initial.direction);
  const [answerVisible, setAnswerVisible] = useState(true);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    saveEntries({ gross: grossText, contract, under26, student, copyright, lang, direction });
  }, [grossText, contract, under26, student, copyright, lang, direction]);

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
  // In netto mode the number in the field is what the person wants to LAND ON,
  // so the gross is solved for it — by running the same engine, never by a
  // second formula. Flipping the direction reinterprets what was typed; it does
  // not convert it and does not throw it away.
  const solved = useMemo(
    () =>
      parsed.kind === 'ok' && direction === 'n2g'
        ? solveGross(parsed.grosz, answers, rates, MAX_GROSS_GROSZ)
        : null,
    [parsed, answers, direction],
  );

  const grossGrosz =
    parsed.kind !== 'ok'
      ? null
      : solved === null
        ? parsed.grosz
        : solved.kind === 'exact'
          ? solved.grossGrosz
          : // No gross gives exactly this net, so the screen shows the closest
            // one — and says so, rather than showing a figure it cannot reach.
            solved.closestGrosz;

  const result = useMemo(
    () => (grossGrosz === null ? null : computeContract(grossGrosz, answers, rates)),
    [grossGrosz, answers],
  );

  // Both messages are computed from THIS entry, in the field's own status slot.
  // Ambiguity is the norm, not an edge case: on uop about two whole-złoty nets
  // in five are produced by more than one gross.
  const amountStatus =
    solved === null
      ? null
      : solved.kind === 'none'
        ? t(lang, 'dir.unreachable', { amount: formatMoney(solved.closestGrosz, lang) })
        : solved.hiGrosz > solved.loGrosz
          ? t(lang, 'dir.ambiguous', {
              lo: formatMoney(solved.loGrosz, lang),
              hi: formatMoney(solved.hiGrosz, lang),
            })
          : null;

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
          {/* The mini-bar is the answer block at any scroll, so it says the
              same thing the answer block says — a bar labelled with one
              direction's eyebrow over the other's figure is the P1-J shape. */}
          <span>{t(lang, direction === 'n2g' ? 'answer.eyebrow.gross' : 'answer.eyebrow')}</span>
          <span aria-hidden="true">·</span>
          <span className={css.stickyAmount}>
            {formatMoney(direction === 'n2g' ? result.grossGrosz : result.netGrosz, lang)} zł
          </span>
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
              direction={direction}
              status={amountStatus}
              under26={under26}
              student={student}
              copyright={copyright}
              consequences={consequences}
              minimumWageGrosz={rates.minimumWageMonthlyGrosz.value}
              onGrossText={setGrossText}
              onDirection={setDirection}
              onUnder26={setUnder26}
              onStudent={setStudent}
              onCopyright={setCopyright}
            />
          </div>

          <div className={css.right}>
            <div ref={answerRef}>
              <Answer lang={lang} result={result} direction={direction} />
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
