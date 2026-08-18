import type { ContractKind } from '../engine/rates';
import { t, type Lang } from '../i18n/strings';
import type { GrossInput } from '../state/gross';
import { Question } from './Question';
import s from './GrossCard.module.css';

type Props = {
  lang: Lang;
  year: number;
  contract: ContractKind;
  grossText: string;
  parsed: GrossInput;
  under26: boolean;
  student: boolean;
  copyright: boolean;
  minimumWageGrosz: number;
  /** What the current answers mean, already interpolated. May be empty. */
  consequences: string[];
  onGrossText: (value: string) => void;
  onUnder26: (value: boolean) => void;
  onStudent: (value: boolean) => void;
  onCopyright: (value: boolean) => void;
};

/**
 * Variant B's one card: the amount and the Nie/Tak questions together, with the
 * consequence of the current answers on its last line.
 *
 * A question appears where it can change the result. The one place that rule is
 * suspended is under-26 on a dzieło: it stays, live, and the screen says the
 * answer changes nothing — see the outlined note in App.
 */
export function GrossCard({
  lang,
  year,
  contract,
  grossText,
  parsed,
  under26,
  student,
  copyright,
  minimumWageGrosz,
  consequences,
  onGrossText,
  onUnder26,
  onStudent,
  onCopyright,
}: Props) {
  // The card carries no aria-label: one here would collide with the input's own
  // label and make "the gross field" ambiguous to a screen reader.
  return (
    <section className={s.card}>
      <div>
        <label className={s.label} htmlFor="gross">
          {t(lang, 'field.gross.label')}
        </label>
        <div className={s.inputRow}>
          <input
            id="gross"
            className={s.input}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={grossText}
            aria-describedby={parsed.kind === 'error' ? 'gross-error' : undefined}
            aria-invalid={parsed.kind === 'error'}
            onChange={(event) => onGrossText(event.target.value)}
          />
          <span className={s.unit}>{t(lang, 'field.gross.unit')}</span>
        </div>
        {parsed.kind === 'error' ? (
          <p className={s.error} id="gross-error">
            {t(lang, parsed.error === 'digits' ? 'error.digits' : 'error.range')}
          </p>
        ) : null}
        <div className={s.quickWrap}>
          <button
            type="button"
            className={s.quick}
            onClick={() => onGrossText(String(minimumWageGrosz / 100))}
          >
            <span className={s.quickChip}>{t(lang, 'field.gross.quickfill', { year })}</span>
          </button>
        </div>
      </div>

      <div className={s.questions}>
        <Question lang={lang} questionKey="q.under26" value={under26} onChange={onUnder26} />
        {contract === 'zlecenie' ? (
          <Question lang={lang} questionKey="q.student" value={student} onChange={onStudent} />
        ) : null}
        {contract === 'dzielo' ? (
          <Question
            lang={lang}
            questionKey="q.copyright"
            value={copyright}
            onChange={onCopyright}
          />
        ) : null}
      </div>

      {consequences.length > 0 ? (
        <div className={s.consequence} data-testid="consequences">
          {consequences.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
