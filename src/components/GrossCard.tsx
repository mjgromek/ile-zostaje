import type { ContractKind } from '../engine/rates';
import { t, type Lang } from '../i18n/strings';
import type { GrossInput } from '../state/gross';
import type { Direction } from '../state/storage';
import { UNITS, type Unit } from '../state/units';
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
  unit: Unit;
  /** The hours-a-week text, as typed. Only asked under the hour unit. */
  hoursText: string;
  /** True when the hours are not a number of hours. The amount is not at fault. */
  hoursError: boolean;
  /** The conversion sentence, already interpolated. Null at the month unit. */
  conversion: string | null;
  /** Ambiguity or unreachability, already interpolated. Never an error. */
  status: string | null;
  under26: boolean;
  student: boolean;
  copyright: boolean;
  /** The minimum wage as the chip prints it — whole złote, already formatted. */
  minimumWageText: string;
  /** The largest amount this unit will take, already formatted. */
  maxAmountText: string;
  /** What the current answers mean, already interpolated. May be empty. */
  consequences: string[];
  onGrossText: (value: string) => void;
  onDirection: (value: Direction) => void;
  onUnit: (value: Unit) => void;
  onHoursText: (value: string) => void;
  /** One click sets the amount, the unit AND the direction the label asserts. */
  onQuickFill: () => void;
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
  unit,
  hoursText,
  hoursError,
  conversion,
  status,
  under26,
  student,
  copyright,
  minimumWageText,
  maxAmountText,
  consequences,
  onGrossText,
  onDirection,
  onUnit,
  onHoursText,
  onQuickFill,
  onUnder26,
  onStudent,
  onCopyright,
}: Props) {
  // §2: a space-separated list, the conversion first because it is always true,
  // then the error OR the ambiguity note — those two remain mutually exclusive.
  const describedBy =
    [
      conversion !== null ? 'amount-conv' : null,
      parsed.kind === 'error' ? 'gross-error' : status !== null ? 'amount-status' : null,
    ]
      .filter((id) => id !== null)
      .join(' ') || undefined;

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
            maxLength={12}
            aria-describedby={describedBy}
            aria-invalid={parsed.kind === 'error'}
            onChange={(event) => onGrossText(event.target.value)}
          />
          {/* One value in two parts, so the divider is decoration and says so. */}
          <span className={s.unitDivider} aria-hidden="true" />
          <label className="visually-hidden" htmlFor="unit">
            {t(lang, 'unit.group')}
          </label>
          <select
            id="unit"
            className={s.unitSelect}
            data-testid="unit-select"
            value={unit}
            onChange={(event) => onUnit(event.target.value as Unit)}
          >
            {UNITS.map((option) => (
              <option key={option} value={option}>
                {t(lang, `unit.${option}`)}
              </option>
            ))}
          </select>
        </div>
        {/* Always true whenever it is shown, which is why it comes FIRST in the
            described-by list: the error and the ambiguity note are about this
            entry, and the conversion is about the arithmetic behind it. */}
        {conversion !== null ? (
          <p className={s.conv} id="amount-conv" data-testid="amount-conv">
            {conversion}
          </p>
        ) : null}
        {/* One slot, two things that are not the same thing: an error, which
            marks the field invalid, and the reverse solve's answer about its
            own answer, which does not. Ambiguity is not a mistake. */}
        {parsed.kind === 'error' ? (
          <p className={s.error} id="gross-error">
            {/* The maximum is a MONTH's maximum recomputed into the active
                unit, so the sentence names what this field will actually take
                rather than a monthly figure the person never typed. */}
            {t(lang, parsed.error === 'digits' ? 'error.digits' : 'error.range', {
              max: maxAmountText,
              unit: t(lang, `unit.${unit}`),
            })}
          </p>
        ) : status !== null ? (
          <p className={s.status} id="amount-status" role="status" data-testid="amount-status">
            {status}
          </p>
        ) : null}
        {/* The hour unit alone. Not disabled and not struck out under the other
            three: for a monthly figure, hours are not a component of the value
            that exists, so the row is simply absent. */}
        {unit === 'hour' ? (
          <>
            <div className={s.hoursRow}>
              <label className={s.hoursLabel} htmlFor="hours">
                {t(lang, 'field.hours.label')}
              </label>
              <div className={s.hoursField}>
                <input
                  id="hours"
                  className={s.hoursInput}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={hoursText}
                  aria-invalid={hoursError}
                  aria-describedby={hoursError ? 'hours-error' : undefined}
                  onChange={(event) => onHoursText(event.target.value)}
                />
                <span className={s.hoursUnit}>{t(lang, 'field.hours.unit')}</span>
              </div>
            </div>
            {hoursError ? (
              <p className={s.error} id="hours-error">
                {t(lang, 'error.hours')}
              </p>
            ) : null}
          </>
        ) : null}
        <div className={s.quickWrap}>
          {/* It states what it is and sets everything it asserts: the amount,
              the unit and the direction. Each of the three is something the
              cited figure genuinely says, and setting them is what makes the
              label true. */}
          <button type="button" className={s.quick} onClick={onQuickFill}>
            <span className={s.quickChip}>
              {t(lang, 'field.gross.quickfill', { year, amount: minimumWageText })}
            </span>
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
