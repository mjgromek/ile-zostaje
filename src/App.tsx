import { useEffect, useMemo, useRef, useState } from 'react';
import { computeContract } from './engine/contract';
import { solveGross } from './engine/solve';
import { RATES_2026 } from './engine/rates-2026';
import type { ContractKind } from './engine/rates';
// `formatZloty` is NOT imported here any more — the quick-fill chip's amount
// slot died with slice 4b item 2. The helper itself stays: Sources.tsx uses it.
import { formatMoney, formatRate, t, type Lang } from './i18n/strings';
import { MAX_GROSS_GROSZ, parseGross } from './state/gross';
import { loadEntries, saveEntries, type Direction } from './state/storage';
import {
  fromMonthlyGrosz,
  maxInUnitGrosz,
  parseHours,
  toMonthlyGrosz,
  type Unit,
} from './state/units';
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
  const [unit, setUnit] = useState<Unit>(initial.unit);
  const [hoursText, setHoursText] = useState(initial.hoursPerWeek);
  const [answerVisible, setAnswerVisible] = useState(true);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    saveEntries({
      gross: grossText,
      contract,
      under26,
      student,
      copyright,
      lang,
      direction,
      unit,
      // Persisted under all four units, not only the one that reads it.
      hoursPerWeek: hoursText,
    });
  }, [grossText, contract, under26, student, copyright, lang, direction, unit, hoursText]);

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

  // The hours are asked, never invented: without a valid answer there is no
  // monthly figure to compute, so the result goes null and the screen says so.
  // The amount itself is not what is wrong, and is not marked so.
  const hours = useMemo(() => parseHours(hoursText), [hoursText]);
  const hoursTenths = hours.kind === 'ok' ? hours.tenths : null;
  const hoursError = unit === 'hour' && hours.kind === 'error';

  // ONE rounding, at the boundary into the engine. The field's own maximum is
  // the monthly cap recomputed into the active unit, floored — which is both
  // the gate and the figure the message names, so a maximum the screen states
  // is a maximum the field enforces. `35 000 zł/godz.` is refused here and
  // never reaches the solver as 60 666 667 zł a month.
  const maxTypedGrosz = useMemo(
    () => maxInUnitGrosz(MAX_GROSS_GROSZ, unit, hoursTenths ?? 0),
    [unit, hoursTenths],
  );
  // With no usable hours there is no monthly figure to bound, so there is
  // nothing for a range check to be true about. The hours field says what is
  // wrong; marking the amount invalid as well would blame the wrong entry.
  const parsed = useMemo(
    () => parseGross(grossText, hoursError ? Number.POSITIVE_INFINITY : maxTypedGrosz),
    [grossText, hoursError, maxTypedGrosz],
  );
  const typedMonthlyGrosz =
    parsed.kind === 'ok' && !hoursError
      ? toMonthlyGrosz(parsed.grosz, unit, hoursTenths ?? 0)
      : null;

  const answers = useMemo(
    () => ({ contract, under26, student, copyright }),
    [contract, under26, student, copyright],
  );
  // In netto mode the number in the field is what the person wants to LAND ON,
  // so the gross is solved for it — by running the same engine, never by a
  // second formula. Flipping the direction reinterprets what was typed; it does
  // not convert it and does not throw it away.
  // The solve runs on the DERIVED monthly figure, in every unit: the engine has
  // one period and the unit ends at the field's edge.
  const solved = useMemo(
    () =>
      typedMonthlyGrosz !== null && direction === 'n2g'
        ? solveGross(typedMonthlyGrosz, answers, rates, MAX_GROSS_GROSZ)
        : null,
    [typedMonthlyGrosz, answers, direction],
  );

  const grossGrosz =
    typedMonthlyGrosz === null
      ? null
      : solved === null
        ? typedMonthlyGrosz
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

  // The sentence that makes the conversion reproducible. It prints the
  // operation, so the reader can arrive at the app's own figure; a rounded
  // intermediate would leave them twelve grosz short and unable to tell why.
  const conversion =
    unit === 'month'
      ? null
      : t(lang, `conv.${unit}`, { hours: hoursText.trim() });

  // The echo, applied ONCE to the monthly grosz the answer shows — never
  // chained back through the amount that was typed, which would round twice.
  const answerMonthlyGrosz =
    result === null ? null : direction === 'n2g' ? result.grossGrosz : result.netGrosz;
  const perUnitGrosz =
    answerMonthlyGrosz === null || unit === 'month'
      ? null
      : fromMonthlyGrosz(answerMonthlyGrosz, unit, hoursTenths ?? 0);

  // What the current answers mean, on the card's last line. Each line is either
  // a rule of the contract or a number computed from this person's entry —
  // never a promise made before the fact.
  const consequences: string[] = [];
  // The annual ZUS ceiling, once it actually bites this month. It is a fact
  // about this entry, not a rule of the contract, so it belongs here and not in
  // a permanent note — and it names both the monthly crossing the person just
  // passed and the annual limit it comes from.
  if (result?.zusCapped) {
    const annual = rates.contributions.annualBaseCeilingGrosz.value;
    consequences.push(
      t(lang, 'note.zusCeiling', {
        amount: formatMoney(Math.round(annual / 12), lang),
        annual: formatMoney(annual, lang),
      }),
    );
  }
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

  // §5.1's trigger set, and ONLY this set, in one place because three groups
  // read it. Typing is excluded by DESIGN-SLICE-1 §3, the unit because the
  // monthly answer often does not move, the under-26 and student answers
  // because §4's band re-form already owns that moment — the two must never
  // co-fire — and the language because it is not a change of the answer.
  const swapKey = `${contract}|${direction}`;

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
              unit={unit}
              hoursText={hoursText}
              hoursError={hoursError}
              conversion={conversion}
              maxAmountText={formatMoney(maxTypedGrosz, lang)}
              onGrossText={setGrossText}
              onDirection={setDirection}
              onUnit={setUnit}
              onHoursText={setHoursText}
              onQuickFill={() => {
                // All three, because all three are what the label asserts: the
                // minimum wage is a monthly BRUTTO figure, and a chip that set
                // only the amount left the screen contradicting its own words.
                setGrossText(String(rates.minimumWageMonthlyGrosz.value / 100));
                setUnit('month');
                setDirection('g2n');
              }}
              onUnder26={setUnder26}
              onStudent={setStudent}
              onCopyright={setCopyright}
            />
          </div>

          <div className={css.right}>
            <div ref={answerRef}>
              <Answer
                lang={lang}
                result={result}
                direction={direction}
                unit={unit}
                perUnitGrosz={perUnitGrosz}
                swapKey={swapKey}
              />
            </div>
            {/* The key is on the component here and INSIDE the section in
                Answer, for the one reason §6 gives: only the answer block holds
                a live region, and a live region that is destroyed and recreated
                does not reliably announce. The band and the ladder hold none.

                Each key is PREFIXED because these two are siblings: keyed with
                the bare swapKey they collide, and React's reconciler keeps one
                of the two old subtrees in the DOM forever — MEASURED, three
                bands on screen after two swaps. */}
            <Band key={`band-${swapKey}`} lang={lang} year={rates.year} result={result} />
            {substitution ? (
              <p className={css.note} data-testid="note-substitution">
                {t(lang, substitution)}
              </p>
            ) : null}
            <Ladder key={`ladder-${swapKey}`} lang={lang} result={result} rates={rates} />
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
