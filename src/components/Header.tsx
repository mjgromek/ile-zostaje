import { LANGS, t, type Lang } from '../i18n/strings';
import s from './Header.module.css';

type Props = {
  lang: Lang;
  year: number;
  onLang: (lang: Lang) => void;
};

/**
 * Wordmark, year chip, language pill. Both language labels stay visible: `PL`
 * and `EN` are two characters each, so a dropdown would cost a tap and a guess
 * for nothing.
 */
export function Header({ lang, year, onLang }: Props) {
  return (
    <header className={s.header}>
      <p className={s.wordmark}>{t(lang, 'app.name')}</p>
      <span className={s.year} data-testid="year-chip">
        {t(lang, 'year.chip', { year })}
      </span>
      <div
        className={s.langs}
        role="radiogroup"
        aria-label={t(lang, 'lang.legend')}
        data-testid="lang-switch"
      >
        {LANGS.map((code) => (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={lang === code}
            aria-label={t(lang, code === 'pl' ? 'lang.pl' : 'lang.en')}
            className={`${s.lang} ${lang === code ? s.langActive : ''}`}
            onClick={() => onLang(code)}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}
