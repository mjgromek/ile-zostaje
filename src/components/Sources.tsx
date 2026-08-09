import type { Cited, YearRates } from '../engine/rates';
import { formatMoney, formatRate, t, type Lang } from '../i18n/strings';
import css from './Sources.module.css';

type Props = {
  lang: Lang;
  rates: YearRates;
};

type Entry = { labelKey: string; cited: Cited<number>; shown: string };

/**
 * Where every number came from. Collapsed by default, because provenance has to
 * be reachable without competing with the answer — but a rate the project
 * cannot cite does not ship, so this list is the whole of the data file.
 */
export function Sources({ lang, rates }: Props) {
  const pct = (cited: Cited<number>) => `${formatRate(cited.value, lang)}%`;
  const zl = (cited: Cited<number>) => `${formatMoney(cited.value, lang)} zł`;

  const entries: Entry[] = [
    { labelKey: 'line.emerytalna', cited: rates.contributions.emerytalna, shown: pct(rates.contributions.emerytalna) },
    { labelKey: 'line.rentowa', cited: rates.contributions.rentowa, shown: pct(rates.contributions.rentowa) },
    { labelKey: 'line.chorobowa', cited: rates.contributions.chorobowa, shown: pct(rates.contributions.chorobowa) },
    { labelKey: 'line.zdrowotna', cited: rates.contributions.zdrowotna, shown: pct(rates.contributions.zdrowotna) },
    { labelKey: 'sources.pit.rate1', cited: rates.pit.firstRatePercent, shown: pct(rates.pit.firstRatePercent) },
    { labelKey: 'sources.pit.rate2', cited: rates.pit.secondRatePercent, shown: pct(rates.pit.secondRatePercent) },
    { labelKey: 'sources.pit.threshold', cited: rates.pit.thresholdAnnualGrosz, shown: zl(rates.pit.thresholdAnnualGrosz) },
    { labelKey: 'sources.pit.reducingYear', cited: rates.pit.taxReducingAnnualGrosz, shown: zl(rates.pit.taxReducingAnnualGrosz) },
    { labelKey: 'sources.pit.reducingMonth', cited: rates.pit.taxReducingMonthlyGrosz, shown: zl(rates.pit.taxReducingMonthlyGrosz) },
    { labelKey: 'sources.pit.costs', cited: rates.pit.deductibleCostsMonthlyGrosz, shown: zl(rates.pit.deductibleCostsMonthlyGrosz) },
    { labelKey: 'sources.relief.limit', cited: rates.youthRelief.annualLimitGrosz, shown: zl(rates.youthRelief.annualLimitGrosz) },
    { labelKey: 'field.gross.quickfill', cited: rates.minimumWageMonthlyGrosz, shown: zl(rates.minimumWageMonthlyGrosz) },
  ];

  return (
    <details className={css.details} data-testid="sources">
      <summary className={css.summary}>{t(lang, 'sources.summary')}</summary>
      <p className={css.intro}>{t(lang, 'sources.intro', { year: rates.year })}</p>
      <ul className={css.list}>
        {entries.map((entry) => (
          <li className={css.item} key={`${entry.labelKey}-${entry.shown}-${entry.cited.source}`}>
            <span className={css.value}>{entry.shown}</span>{' '}
            {t(lang, entry.labelKey, { year: rates.year })}
            <span className={css.meta}>
              {/* Verbatim from a Polish official page, so it stays Polish and
                  says so, in both builds. A quote is evidence, not a label. */}
              <span lang="pl">{entry.cited.quote}</span>
              <br />
              <a href={entry.cited.source} rel="noreferrer noopener" target="_blank">
                {entry.cited.sourceTitle}
              </a>{' '}
              · {t(lang, 'sources.effective', { date: entry.cited.effective })}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
