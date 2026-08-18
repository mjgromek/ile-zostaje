import { t, type Lang } from '../i18n/strings';
import s from './Question.module.css';

type Props = {
  lang: Lang;
  /** The string key of the question, which is also the group's label. */
  questionKey: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

/**
 * One Nie/Tak question. Variant B asks; it does not switch — three questions
 * need one control, and a switch cannot carry a question mark.
 *
 * DESIGN-SLICE-1 §4's motion sequence survives intact: this replaces the
 * control, not the moment it opens.
 */
export function Question({ lang, questionKey, value, onChange }: Props) {
  const question = t(lang, questionKey);
  return (
    <div className={s.row}>
      <span className={s.legend} id={`${questionKey}-label`}>
        {question}
      </span>
      <div className={s.pill} role="radiogroup" aria-label={question}>
        {[false, true].map((option) => (
          <button
            key={String(option)}
            type="button"
            role="radio"
            aria-checked={value === option}
            className={`${s.segment} ${value === option ? s.active : ''}`}
            onClick={() => onChange(option)}
          >
            {t(lang, option ? 'q.yes' : 'q.no')}
          </button>
        ))}
      </div>
    </div>
  );
}
