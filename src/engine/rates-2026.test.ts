import { expect, test } from 'vitest';
import type { Cited, YearRates } from './rates';
import { RATES_2026 } from './rates-2026';

// `quote` is documented as verbatim from the page in `source`. A quote that
// reads well but is not on that page breaks the one invariant the field exists
// for, and no arithmetic test can catch it — the number can be right while the
// evidence is invented.
//
// PAGE_TEXT below is the evidence, frozen: passages fetched from those URLs on
// 2026-08-18, de-tagged and whitespace-collapsed, recorded here so the check
// runs offline. The app must never reach the network and neither must its
// tests. Re-verifying means re-fetching the page and updating a passage here,
// which is exactly the work a citation deserves — slice 2 re-fetched all eight
// pages slice 1 cited as well as its own four, rather than assuming the old
// ones were still clean because they passed once.

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
  // The one page that states, in three sentences, what a zlecenie is inside and
  // what a dzieło is outside. Slice 2's ZUS rules are all read off it.
  'ZUS — Umowy zlecenia i umowy o dzieło w ubezpieczeniach społecznych': [
    'Umowa zlecenia Wykonujesz umowę zlecenia bądź umowę o świadczenie usług? Obejmiemy Cię ' +
      'ubezpieczeniami: emerytalnym, rentowymi, wypadkowym i zdrowotnym. Ubezpieczenie ' +
      'chorobowe jest dobrowolne. Ważne! Jako zleceniobiorca możesz nie być objęty ' +
      'obowiązkowo ubezpieczeniami społecznymi, jeśli masz inny tytuł do ubezpieczeń, np. ' +
      'pracujesz na cały etat. Nie obejmiemy Cię ubezpieczeniami, jeśli jesteś uczniem lub ' +
      'studentem i nie skończyłeś 26 lat.',
    'Umowa o dzieło Zawarłeś umowę o dzieło? Nie obejmiemy Cię ubezpieczeniami społecznymi i ' +
      'ubezpieczeniem zdrowotnym ani obowiązkowo, ani dobrowolnie.',
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
      'uzyskiwania przychodów z jednego stosunku pracy, 4500 zł - w przypadku uzyskiwania ' +
      'przychodów równocześnie z więcej niż jednego stosunku pracy,',
  ],
  'podatki.gov.pl — Dochody z umowy zlecenia lub o dzieło': [
    'Koszty 20% Do przychodów z umów zlecenia/o dzieło możesz zastosować koszty uzyskania ' +
      'przychodów ustalone według normy procentowej w wysokości 20% uzyskanego przychodu, ' +
      'pomniejszonego o potrącone przez płatnika z Twoich środków w danym miesiącu składki ' +
      'na ubezpieczenia społeczne, których podstawę wymiaru stanowi ten przychód.',
  ],
  'podatki.gov.pl — Dochody z praw autorskich': [
    'Koszty 50% Do przychodów z praw autorskich i pokrewnych możesz zastosować koszty ' +
      'uzyskania przychodów w wysokości 50% uzyskanego przychodu.',
    'Ważne: 50% koszty uzyskania przychodów ze wszystkich tytułów nie mogą przekroczyć w ' +
      'roku podatkowym kwoty 120 000 zł.',
  ],
  'podatki.gov.pl — PIT-2, PIT-2A, PIT-3': [
    'W konsekwencji 1/12 kwoty zmniejszającej podatek stosowana przez płatnika przy ' +
      'obliczaniu miesięcznych zaliczek wynosi 300 zł.',
  ],
  'podatki.gov.pl — Ulga dla młodych': [
    'Jaka jest kwota zwolnienia Zwolnieniu od podatku podlegają przychody do wysokości ' +
      'nieprzekraczającej 85 528 zł w roku podatkowym.',
    'Ulga obejmuje przychody z: pracy na etacie (umowa o pracę, stosunek służbowy, praca ' +
      'nakładcza, spółdzielczy stosunek pracy), umowy zlecenia zawartej przez osobę fizyczną ' +
      'z: podmiotem prowadzącym działalność gospodarczą, właścicielem (posiadaczem) ' +
      'nieruchomości, w której lokale są wynajmowane lub działającym w jego imieniu zarządcą ' +
      'albo administratorem – jeżeli usługi są wykonywane wyłącznie dla potrzeb związanych z ' +
      'tą nieruchomością albo przedsiębiorstwem w spadku, Pamiętaj! Ulga nie dotyczy ' +
      'przychodów uzyskanych na podstawie umów o zarządzanie przedsiębiorstwem, kontraktów ' +
      'menedżerskich lub umów o podobnym charakterze. tytułu odbywania praktyki absolwenckiej ' +
      ', o której mowa w ustawie z dnia 17 lipca 2009 r. o praktykach absolwenckich, tytułu ' +
      'odbywania stażu uczniowskiego , o którym mowa w art. 121a ustawy z dnia 14 grudnia ' +
      '2016 r. – Prawo oświatowe, zasiłku macierzyńskiego , o którym mowa w ustawie z dnia 25 ' +
      'czerwca 1999 r. o świadczeniach pieniężnych z ubezpieczenia społecznego w razie ' +
      'choroby i macierzyństwa.',
  ],
  'Ministerstwo Rodziny, Pracy i Polityki Społecznej — Minimalne wynagrodzenie za pracę': [
    'Od 1 stycznia 2026 r. minimalne wynagrodzenie za pracę wynosi 4806 zł.',
  ],
};

/**
 * Collapses whitespace — the pages use non-breaking spaces inside amounts and
 * markup boundaries turn into ordinary ones — and nothing else. It used to drop
 * one trailing mark so a list item printed with a comma could be quoted as a
 * sentence; that is the licence two slice 1 quotes took, and a quote that
 * normalises the page's punctuation is the page's words in someone else's
 * voice. Whitespace is the markup's; punctuation is the page's.
 */
function normalise(text: string): string {
  return text.normalize('NFC').replace(/\s+/g, ' ').trim();
}

function citedValues(rates: YearRates): { path: string; cited: Cited<unknown> }[] {
  const { zlecenie, dzielo } = rates.contracts;
  return [
    ...Object.entries(rates.contributions).map(([key, cited]) => ({
      path: `contributions.${key}`,
      cited: cited as Cited<unknown>,
    })),
    ...Object.entries(rates.pit).map(([key, cited]) => ({
      path: `pit.${key}`,
      cited: cited as Cited<unknown>,
    })),
    ...Object.entries(zlecenie).map(([key, cited]) => ({
      path: `contracts.zlecenie.${key}`,
      cited: cited as Cited<unknown>,
    })),
    ...Object.entries(dzielo).map(([key, cited]) => ({
      path: `contracts.dzielo.${key}`,
      cited: cited as Cited<unknown>,
    })),
    { path: 'youthRelief.annualLimitGrosz', cited: rates.youthRelief.annualLimitGrosz },
    { path: 'youthRelief.contracts', cited: rates.youthRelief.contracts },
    { path: 'minimumWageMonthlyGrosz', cited: rates.minimumWageMonthlyGrosz },
  ];
}

test('every quote is verbatim from the page it cites', () => {
  const entries = citedValues(RATES_2026);
  expect(entries.length).toBe(20);

  for (const { path, cited } of entries) {
    const passages = PAGE_TEXT[cited.sourceTitle] ?? [];
    expect(
      passages.length,
      `${path}: no page text recorded for "${cited.sourceTitle}"`,
    ).toBeGreaterThan(0);

    const quote = normalise(cited.quote);
    const onPage = passages.some((passage) => normalise(passage).includes(quote));
    expect(
      onPage,
      `${path}: quote is not printed on ${cited.source}\n    quote: ${quote}`,
    ).toBe(true);
  }
});

// Criterion 5 asks for three things per entry, and a quote is only one of them.
// A citation with no URL or no effective date is a claim about a number, not a
// source for it.
test('every cited value carries an official source URL and an effective date', () => {
  const official = /^https:\/\/(www\.)?(zus\.pl|podatki\.gov\.pl|gov\.pl|isap\.sejm\.gov\.pl)\//;
  for (const { path, cited } of citedValues(RATES_2026)) {
    expect(cited.source, `${path}: source is not an official page`).toMatch(official);
    expect(cited.effective, `${path}: no effective date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(cited.verified, `${path}: no verification date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(cited.sourceTitle.length, `${path}: no source title`).toBeGreaterThan(0);
  }
});

// P2-6, promoted out of BACKLOG into this slice because a later slice now uses
// an annual cap. The 3 000 zł annual limit on the flat koszty holds for ONE
// employment relationship; the quote used to stop before that clause and so
// printed a conditional limit as an absolute one.
test('a quote that carries a conditional limit carries its condition too', () => {
  const costs = RATES_2026.pit.deductibleCostsMonthlyGrosz;
  expect(costs.quote).toContain('3000 zł');
  expect(costs.quote).toContain('z jednego stosunku pracy');
});
