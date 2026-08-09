import { t, type Lang } from '../i18n/strings';
import type { GrossInput } from '../state/gross';
import s from './GrossCard.module.css';

type Props = {
  lang: Lang;
  year: number;
  grossText: string;
  parsed: GrossInput;
  under26: boolean;
  minimumWageGrosz: number;
  onGrossText: (value: string) => void;
  onUnder26: (value: boolean) => void;
};

const CONTRACTS = [
  { key: 'contract.uop', enabled: true },
  { key: 'contract.zlecenie', enabled: false },
  { key: 'contract.dzielo', enabled: false },
] as const;

/**
 * The inputs. The contract control has all three slots from day one with two
 * disabled, so slice two removes two attributes and changes no layout.
 */
export function GrossCard({
  lang,
  year,
  grossText,
  parsed,
  under26,
  minimumWageGrosz,
  onGrossText,
  onUnder26,
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

      <div>
        <span className={s.label} id="contract-label">
          {t(lang, 'field.contract.label')}
        </span>
        <div className={s.segmented} role="radiogroup" aria-labelledby="contract-label">
          {CONTRACTS.map((contract) => (
            <button
              key={contract.key}
              type="button"
              role="radio"
              aria-checked={contract.enabled}
              disabled={!contract.enabled}
              className={`${s.segment} ${contract.enabled ? s.segmentActive : ''}`}
            >
              {t(lang, contract.key)}
            </button>
          ))}
        </div>
        <p className={s.help}>{t(lang, 'contract.help')}</p>
      </div>

      <div>
        <label className={s.switchRow}>
          <span className={s.switchControl}>
            <input
              className={s.checkbox}
              type="checkbox"
              role="switch"
              checked={under26}
              onChange={(event) => onUnder26(event.target.checked)}
            />
            <span className={s.track} aria-hidden="true">
              <span className={s.thumb} />
            </span>
          </span>
          <span className={s.switchLabel}>{t(lang, 'field.under26.label')}</span>
        </label>
        <p className={s.hint}>{t(lang, 'field.under26.hint')}</p>
      </div>
    </section>
  );
}
