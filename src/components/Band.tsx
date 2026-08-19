import type { ContractResult } from '../engine/contract';
import { formatMoney, formatPercent, t, type Lang } from '../i18n/strings';
import s from './Band.module.css';

type Props = {
  lang: Lang;
  year: number;
  result: ContractResult | null;
};

/**
 * One horizontal bar whose full width IS the gross. Summation becomes a
 * geometric fact rather than a claim.
 *
 * Widths come from the engine's grosz values; the percentages are derived from
 * those grosz for display only and are never fed back into the arithmetic.
 */
export function Band({ lang, year, result }: Props) {
  if (result === null || result.grossGrosz === 0) {
    return (
      <div className={`${s.wrap} swap`}>
        <p className={s.empty}>{t(lang, 'empty.band')}</p>
      </div>
    );
  }

  const gross = result.grossGrosz;
  const netShare = result.netGrosz / gross;

  return (
    <div className={`${s.wrap} swap`}>
      <div className={s.band} data-testid="band">
        <div
          className={`${s.segment} ${s.net}`}
          data-testid="band-net"
          style={{ flexBasis: `${netShare * 100}%` }}
        >
          {t(lang, 'band.net', { pct: formatPercent(netShare, lang) })}
        </div>
        {result.lines.map((line) => (
          <div
            key={line.key}
            className={`${s.segment} ${s[line.key] ?? ''}`}
            data-testid={`band-${line.key}`}
            style={{
              flex: `0 0 ${(line.amountGrosz / gross) * 100}%`,
              // The 4 px floor keeps rentowa at 1,5% visible. A line that is
              // genuinely zero must disappear instead, or the relief looks
              // like it left a sliver of tax behind.
              minWidth: line.amountGrosz === 0 ? 0 : undefined,
            }}
          />
        ))}
      </div>
      <div className={s.captions}>
        <span>{t(lang, 'band.left', { gross: formatMoney(gross, lang) })}</span>
        <span>{t(lang, 'band.right', { pct: formatPercent(1 - netShare, lang) })}</span>
      </div>
      <p className={s.year}>{t(lang, 'year.inline', { year })}</p>
    </div>
  );
}
