import type { CSSProperties } from 'react';
import type { ContractResult, Line } from '../engine/contract';
import type { YearRates } from '../engine/rates';
import { formatMoney, formatRate, t, type Lang } from '../i18n/strings';
import css from './Ladder.module.css';

type Props = {
  lang: Lang;
  result: ContractResult | null;
  rates: YearRates;
};

const SWATCH: Record<Line['key'], string> = {
  emerytalna: 'var(--plum-1)',
  rentowa: 'var(--plum-2)',
  chorobowa: 'var(--plum-3)',
  zdrowotna: 'var(--plum-4)',
  // The collapsed row is not a składka, so it does not take a plum. It is a
  // normal row in a normal table, not an ARIA trick.
  zusOff: 'var(--line)',
  pit: 'var(--graphite)',
};

/**
 * Polish payroll is sequential — ZUS reduces the base for zdrowotna, which
 * reduces the base for PIT — so the order carries information. The running
 * remainder ends at the net figure at the top of the screen, and that identity
 * is what makes the sum visible to a person rather than only to a checker.
 *
 * The why-line is the teaching: not a legend, but the rule applied to this
 * person's number, which is where they learn zdrowotna is not 9% of the gross.
 */
export function Ladder({ lang, result, rates }: Props) {
  if (result === null) return null;

  const whyLine = (line: Line): string => {
    if (line.key === 'zdrowotna') {
      return t(lang, 'why.zdrowotna', {
        rate: formatRate(line.ratePercent, lang),
        base: formatMoney(line.baseGrosz, lang),
      });
    }
    if (line.key === 'zusOff') return t(lang, 'why.zusOff');
    if (line.key === 'pit') {
      const shared = {
        rate: formatRate(line.ratePercent, lang),
        base: formatMoney(line.baseGrosz, lang),
        kwota: formatMoney(rates.pit.taxReducingMonthlyGrosz.value, lang),
      };
      // The flat quota is a number the reader already saw; a percentage is a
      // rule, so the row shows what it produced on this person's amount.
      if (result.costsPercent === null) return t(lang, 'why.pit', shared);
      const kup = t(lang, 'why.kup.inline', {
        pct: formatRate(result.costsPercent, lang),
        amount: formatMoney(result.costsGrosz, lang),
      });
      const key =
        result.contract === 'dzielo'
          ? 'why.pit.dzielo'
          : result.zusExempt
            ? 'why.pit.zlecenie.nozus'
            : 'why.pit.zlecenie';
      return t(lang, key, { ...shared, kup });
    }
    return t(lang, 'why.simple', {
      rate: formatRate(line.ratePercent, lang),
      base: formatMoney(line.baseGrosz, lang),
    });
  };

  // Struck, not omitted: a line the relief zeroed FOR THIS PERSON keeps its
  // original amount visible, because what the relief is worth teaches more
  // than a zero. A line the contract does not have is absent instead.
  const reliefOnPit = result.reliefApplies && result.pitWithoutReliefGrosz > 0;

  return (
    <table className={css.table} data-testid="ladder">
      <caption className="visually-hidden">{t(lang, 'ladder.caption')}</caption>
      <thead className={css.head}>
        <tr>
          <th scope="col">{t(lang, 'ladder.head.what')}</th>
          <th scope="col">{t(lang, 'ladder.head.left')}</th>
        </tr>
      </thead>
      <tbody>
        {result.lines.map((line) => (
          <tr key={line.key} className={css.row} data-testid={`line-${line.key}`}>
            <td>
              <span className={css.name} style={{ '--swatch': SWATCH[line.key] } as CSSProperties}>
                {t(lang, `line.${line.key}`)}
              </span>
              <p className={css.why}>{whyLine(line)}</p>
              {line.key === 'pit' && reliefOnPit ? (
                <span className={css.chip}>{t(lang, 'why.relief.chip')}</span>
              ) : null}
            </td>
            <td className={css.amounts}>
              <span className={css.amount} data-testid={`line-${line.key}-amount`}>
                {line.key === 'pit' && reliefOnPit ? (
                  <s className={css.struck}>
                    − {formatMoney(result.pitWithoutReliefGrosz, lang)} zł
                  </s>
                ) : null}
                {line.amountGrosz === 0 ? '0 zł' : `− ${formatMoney(line.amountGrosz, lang)} zł`}
              </span>
              <span className={css.remainder}>{formatMoney(line.remainderGrosz, lang)} zł</span>
            </td>
          </tr>
        ))}
        <tr className={css.total} data-testid="ladder-total">
          <td>
            <span
              className={`${css.name} ${css.totalName}`}
              style={{ '--swatch': 'var(--honey)' } as CSSProperties}
            >
              {t(lang, 'line.net')}
            </span>
            <p className={css.why}>
              {t(lang, 'total.from', { gross: formatMoney(result.grossGrosz, lang) })}
            </p>
          </td>
          <td className={css.amounts}>
            <span className={css.totalAmount}>{formatMoney(result.netGrosz, lang)} zł</span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
