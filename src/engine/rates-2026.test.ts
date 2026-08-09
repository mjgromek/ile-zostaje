import { expect, test } from 'vitest';
import type { Cited, YearRates } from './rates';
import { RATES_2026 } from './rates-2026';

// `quote` is documented as verbatim from the page in `source`. A quote that
// reads well but is not on that page breaks the one invariant the field exists
// for, and no arithmetic test can catch it — the number can be right while the
// evidence is invented.
//
// PAGE_TEXT below is the evidence, frozen: passages fetched from those URLs on
// 2026-08-09, de-tagged and whitespace-collapsed, recorded here so the check
// runs offline. The app must never reach the network (criterion 7) and neither
// must its tests. Re-verifying means re-fetching the page and updating a
// passage here, which is exactly the work a citation deserves.

const PAGE_TEXT: Record<string, string[]> = {
  'ZUS — Finansowanie składek na ubezpieczenia społeczne': [
    'Składki na ubezpieczenie emerytalne finansujecie w równych częściach Ty i Twój płatnik ' +
      'składek (po 9,76 proc. podstawy wymiaru składek). Składki na ubezpieczenia rentowe ' +
      'finansujecie: Ty – w wysokości 1,5 proc. podstawy wymiaru, Twój płatnik składek – w ' +
      'wysokości 6,5 proc. podstawy wymiaru, Składki na ubezpieczenie chorobowe finansujesz ' +
      'w całości Ty. Składki na ubezpieczenie wypadkowe finansuje w całości Twój płatnik składek.',
  ],
  'ZUS — Wysokość składek na ubezpieczenia społeczne': [
    'Wysokości składek na ubezpieczenia emerytalne, rentowe, chorobowe i wypadkowe wyrażone ' +
      'są w formie stopy procentowej i wynoszą: na ubezpieczenie emerytalne – 19,52% podstawy ' +
      'wymiaru, na ubezpieczenia rentowe – 8,00% podstawy wymiaru, na ubezpieczenie chorobowe ' +
      '– 2,45% podstawy wymiaru, na ubezpieczenie wypadkowe – stopa procentowa składki jest ' +
      'zróżnicowana',
  ],
  'ZUS — Wysokość składki na ubezpieczenie zdrowotne': [
    'Składka na ubezpieczenie zdrowotne wynosi 9 proc. podstawy wymiaru. Składka ta jest ' +
      'miesięczna i niepodzielna.',
  ],
  'podatki.gov.pl — Opodatkowanie według skali podatkowej': [
    'Stawka podatku uzależniona jest od wysokości uzyskanego dochodu i wynosi: 12% dla ' +
      'podstawy obliczenia podatku do wysokości 120 000 zł 32% dla podstawy obliczenia ' +
      'podatku powyżej 120 000 zł – od nadwyżki ponad tę kwotę. Kwota zmniejszająca podatek ' +
      'wynosi 3600 zł.',
  ],
  'podatki.gov.pl — Dochody z pracy': [
    'W 2026 roku zryczałtowane koszty uzyskania przychodów z pracy wynoszą: 250 zł ' +
      'miesięcznie, a za rok podatkowy łącznie nie więcej niż: 3000 zł - w przypadku ' +
      'uzyskiwania przychodów z jednego stosunku pracy,',
  ],
  'podatki.gov.pl — PIT-2, PIT-2A, PIT-3': [
    'W konsekwencji 1/12 kwoty zmniejszającej podatek stosowana przez płatnika przy ' +
      'obliczaniu miesięcznych zaliczek wynosi 300 zł.',
  ],
  'podatki.gov.pl — Ulga dla młodych': [
    'Jaka jest kwota zwolnienia Zwolnieniu od podatku podlegają przychody do wysokości ' +
      'nieprzekraczającej 85 528 zł w roku podatkowym.',
  ],
  'Ministerstwo Rodziny, Pracy i Polityki Społecznej — Minimalne wynagrodzenie za pracę': [
    'Od 1 stycznia 2026 r. minimalne wynagrodzenie za pracę wynosi 4806 zł.',
  ],
};

/**
 * Collapses whitespace — the pages use non-breaking spaces inside amounts and
 * markup boundaries turn into ordinary ones — and drops one trailing mark, so a
 * list item printed with a comma may be quoted as a sentence. Nothing inside
 * the passage is touched: the words must be the page's own.
 */
function normalise(text: string): string {
  return text.normalize('NFC').replace(/\s+/g, ' ').trim().replace(/[.,;:]$/, '');
}

function citedValues(rates: YearRates): { path: string; cited: Cited<number> }[] {
  return [
    ...Object.entries(rates.contributions).map(([key, cited]) => ({
      path: `contributions.${key}`,
      cited,
    })),
    ...Object.entries(rates.pit).map(([key, cited]) => ({ path: `pit.${key}`, cited })),
    { path: 'youthRelief.annualLimitGrosz', cited: rates.youthRelief.annualLimitGrosz },
    { path: 'minimumWageMonthlyGrosz', cited: rates.minimumWageMonthlyGrosz },
  ];
}

test('every quote is verbatim from the page it cites', () => {
  const entries = citedValues(RATES_2026);
  expect(entries.length).toBe(12);

  for (const { path, cited } of entries) {
    const passages = PAGE_TEXT[cited.sourceTitle];
    expect(passages, `${path}: no page text recorded for "${cited.sourceTitle}"`).toBeDefined();

    const quote = normalise(cited.quote);
    const onPage = passages.some((passage) => normalise(passage).includes(quote));
    expect(
      onPage,
      `${path}: quote is not printed on ${cited.source}\n    quote: ${quote}`,
    ).toBe(true);
  }
});
