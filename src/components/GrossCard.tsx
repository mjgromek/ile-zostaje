import type { ContractKind } from '../engine/rates';
import { t, type Lang } from '../i18n/strings';
import type { GrossInput } from '../state/gross';
import type { Direction } from '../state/storage';
import { UNITS, type Unit } from '../state/units';
import { Question } from './Question';
import s from './GrossCard.module.css';

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

  // §2.1: the label IS the current direction, so the two halves of the settled
  // string are split off the arrow the same way the two segments were.
  const [before = '', after = ''] = t(lang, `dir.${direction}`)
    .split('→')
    .map((part) => part.trim());

  // The card carries no aria-label: one here would collide with the input's own
  // label and make "the gross field" ambiguous to a screen reader.
  return (
    <section className={s.card}>
      <div>
        {/* §3: its own row, immediately above the label — a control is read
            before the field whose meaning it changes.

            ONE button whose name IS the current mode, and no second state
            channel: no aria-pressed, no role="switch", no aria-checked. The
            accessible name carries purpose and current value together, and a
            `pressed` state beside a name that already states the mode asserts
            it twice and can be read out in conflict. The arrow is decoration,
            as it was in slice 3; `dir.group` survives as the visually-hidden
            purpose prefix now that no group label carries it. */}
        <div className={s.dirRow}>
          <span>{t(lang, 'dir.label')}</span>
          <button
            type="button"
            className={s.dirToggle}
            data-testid="dir-toggle"
            data-direction={direction}
            onClick={() => onDirection(direction === 'g2n' ? 'n2g' : 'g2n')}
          >
            <span className="visually-hidden">{t(lang, 'dir.group')}: </span>
            {before}
            <span aria-hidden="true">{'→'}</span>
            {after}
            {/* The swap mark is chrome and the arrow is content; the colour is
                what says which is which. At ink they read as one cluster. */}
            <svg
              className={s.dirSwap}
              aria-hidden="true"
              width="12"
              height="12"
              viewBox="0 0 12 12"
            >
              <path
                d="M1.5 4h9M8.5 1.5 11 4 8.5 6.5M10.5 8h-9M3.5 5.5 1 8l2.5 2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
          {/* The amount is gone from the label and NOT from the click: it still
              sets the amount, the unit and the direction, which is what keeps
              P2-L closed. The label is now narrower than its effect, which is
              the recorded cost of the stakeholder's shorter label. */}
          <button type="button" className={s.quick} onClick={onQuickFill}>
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
