import type { ContractKind } from '../engine/rates';
import { t, type Lang } from '../i18n/strings';
import type { GrossInput } from '../state/gross';
import type { Direction } from '../state/storage';
import { Question } from './Question';
import s from './GrossCard.module.css';

const DIRECTIONS: Direction[] = ['g2n', 'n2g'];

type Props = {
  lang: Lang;
  year: number;
  contract: ContractKind;
  grossText: string;
  parsed: GrossInput;
  direction: Direction;
  /** Ambiguity or unreachability, already interpolated. Never an error. */
  status: string | null;
  under26: boolean;
  student: boolean;
  copyright: boolean;
  minimumWageGrosz: number;
  /** What the current answers mean, already interpolated. May be empty. */
  consequences: string[];
  onGrossText: (value: string) => void;
  onDirection: (value: Direction) => void;
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
  direction,
  status,
  under26,
  student,
  copyright,
  minimumWageGrosz,
  consequences,
  onGrossText,
  onDirection,
  onUnder26,
  onStudent,
  onCopyright,
}: Props) {
  // The card carries no aria-label: one here would collide with the input's own
  // label and make "the gross field" ambiguous to a screen reader.
  return (
    <section className={s.card}>
      <div>
        {/* §3: its own row, immediately above the label — a control is read
            before the field whose meaning it changes. The arrow is decoration
            for a screen reader; the group's own label carries the meaning. */}
        <div className={s.dirRow}>
          <span>{t(lang, 'dir.label')}</span>
          <div className={s.dir} role="radiogroup" aria-label={t(lang, 'dir.group')}>
            {DIRECTIONS.map((option) => {
              const [before = '', after = ''] = t(lang, `dir.${option}`).split('→');
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  data-testid={`dir-${option}`}
                  aria-checked={direction === option}
                  className={`${s.dirSeg} ${direction === option ? s.active : ''}`}
                  onClick={() => onDirection(option)}
                >
                  {before}
                  <span aria-hidden="true">→</span>
                  {after}
                </button>
              );
            })}
          </div>
        </div>

        <label className={s.label} htmlFor="gross">
          {t(lang, direction === 'n2g' ? 'field.amount.label.net' : 'field.amount.label.gross')}
        </label>
        <div className={s.inputRow}>
          <input
            id="gross"
            className={s.input}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={grossText}
            aria-describedby={
              parsed.kind === 'error'
                ? 'gross-error'
                : status !== null
                  ? 'amount-status'
                  : undefined
            }
            aria-invalid={parsed.kind === 'error'}
            onChange={(event) => onGrossText(event.target.value)}
          />
          <span className={s.unit}>{t(lang, 'field.gross.unit')}</span>
        </div>
        {/* One slot, two things that are not the same thing: an error, which
            marks the field invalid, and the reverse solve's answer about its
            own answer, which does not. Ambiguity is not a mistake. */}
        {parsed.kind === 'error' ? (
          <p className={s.error} id="gross-error">
            {t(lang, parsed.error === 'digits' ? 'error.digits' : 'error.range')}
          </p>
        ) : status !== null ? (
          <p className={s.status} id="amount-status" role="status" data-testid="amount-status">
            {status}
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
