import type { YearRates } from './rates';

// Rates for the 2026 tax year, umowa o pracę, employee-financed share.
//
// Every entry was read off the page named in `source` on the date in `verified`;
// `quote` is what that page prints. Nothing here comes from memory, and a value
// that could not be cited was cut rather than shipped.
//
// Editing one number here and reloading must change the net on screen. That is
// the whole point of the file: no engine branch may hold a rate of its own.

const ZUS_RATES =
  'https://www.zus.pl/pracujacy/system-ubezpieczen-spolecznych-w-polsce/wysokosc-skladek-na-ubezpieczenia-spoleczne';
const ZUS_FINANCING =
  'https://www.zus.pl/pracujacy/system-ubezpieczen-spolecznych-w-polsce/finansowanie-skladek-na-ubezpieczenia-spoleczne';
const ZUS_HEALTH_RATE =
  'https://www.zus.pl/pracujacy/ubezpieczenie-zdrowotne-w-polsce/wyskosc-skladki-na-ubezpieczenie-zdrowotne';
const PIT_SCALE =
  'https://www.podatki.gov.pl/podatki-firmowe/pit/informacje-podstawowe/co-jest-opodatkowane/opodatkowanie-wedlug-skali-podatkowej';
const PIT_WORK =
  'https://www.podatki.gov.pl/podatki-osobiste/pit/informacje-podstawowe/co-jest-opodatkowane/dochody-z-pracy';
const PIT_2 =
  'https://www.podatki.gov.pl/poradniki-i-informatory/pit-2-pit-2a-pit-3-zasady-skladania-oswiadczen-o-stosowaniu-pomniejszenia-zaliczki-o-kwote-zmniejszajaca-podatek-112-124-lub-136';
const YOUTH_RELIEF = 'https://www.podatki.gov.pl/ulgi-i-odliczenia/ulga-dla-mlodych-pit';
const MINIMUM_WAGE = 'https://www.gov.pl/web/rodzina/minimalne-wynagrodzenie-za-prace';

const VERIFIED = '2026-08-09';

export const RATES_2026: YearRates = {
  year: 2026,

  contributions: {
    emerytalna: {
      value: 9.76,
      quote:
        'Składki na ubezpieczenie emerytalne finansujecie w równych częściach Ty i Twój płatnik składek (po 9,76 proc. podstawy wymiaru składek).',
      source: ZUS_FINANCING,
      sourceTitle: 'ZUS — Finansowanie składek na ubezpieczenia społeczne',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
    rentowa: {
      value: 1.5,
      quote:
        'Składki na ubezpieczenia rentowe finansujecie: Ty – w wysokości 1,5 proc. podstawy wymiaru, Twój płatnik składek – w wysokości 6,5 proc. podstawy wymiaru.',
      source: ZUS_FINANCING,
      sourceTitle: 'ZUS — Finansowanie składek na ubezpieczenia społeczne',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
    chorobowa: {
      value: 2.45,
      quote:
        'na ubezpieczenie chorobowe – 2,45% podstawy wymiaru. Składki na ubezpieczenie chorobowe finansujesz w całości Ty.',
      source: ZUS_RATES,
      sourceTitle: 'ZUS — Wysokość składek na ubezpieczenia społeczne',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
    zdrowotna: {
      value: 9,
      quote: 'Składka na ubezpieczenie zdrowotne wynosi 9 proc. podstawy wymiaru.',
      source: ZUS_HEALTH_RATE,
      sourceTitle: 'ZUS — Wysokość składki na ubezpieczenie zdrowotne',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
  },

  pit: {
    firstRatePercent: {
      value: 12,
      quote: '12% dla podstawy obliczenia podatku do wysokości 120 000 zł',
      source: PIT_SCALE,
      sourceTitle: 'podatki.gov.pl — Opodatkowanie według skali podatkowej',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
    secondRatePercent: {
      value: 32,
      quote:
        '32% dla podstawy obliczenia podatku powyżej 120 000 zł – od nadwyżki ponad tę kwotę.',
      source: PIT_SCALE,
      sourceTitle: 'podatki.gov.pl — Opodatkowanie według skali podatkowej',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
    thresholdAnnualGrosz: {
      value: 12_000_000,
      quote:
        'Skala podatkowa w 2026 roku: do 120 000 — 12% minus kwota zmniejszająca podatek 3 600 zł; ponad 120 000 — 10 800 zł + 32% nadwyżki ponad 120 000 zł.',
      source: PIT_WORK,
      sourceTitle: 'podatki.gov.pl — Dochody z pracy',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
    taxReducingAnnualGrosz: {
      value: 360_000,
      quote: 'Kwota zmniejszająca podatek wynosi 3600 zł.',
      source: PIT_SCALE,
      sourceTitle: 'podatki.gov.pl — Opodatkowanie według skali podatkowej',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
    taxReducingMonthlyGrosz: {
      value: 30_000,
      quote:
        '1/12 kwoty zmniejszającej podatek stosowana przez płatnika przy obliczaniu miesięcznych zaliczek wynosi 300 zł.',
      source: PIT_2,
      sourceTitle: 'podatki.gov.pl — PIT-2, PIT-2A, PIT-3',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
    deductibleCostsMonthlyGrosz: {
      value: 25_000,
      quote:
        'W 2026 roku zryczałtowane koszty uzyskania przychodów z pracy wynoszą: 250 zł miesięcznie, a za rok podatkowy łącznie nie więcej niż 3000 zł – w przypadku uzyskiwania przychodów z jednego stosunku pracy.',
      source: PIT_WORK,
      sourceTitle: 'podatki.gov.pl — Dochody z pracy',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
  },

  youthRelief: {
    annualLimitGrosz: {
      value: 8_552_800,
      quote:
        'Zwolnieniu od podatku podlegają przychody do wysokości nieprzekraczającej 85 528 zł w roku podatkowym.',
      source: YOUTH_RELIEF,
      sourceTitle: 'podatki.gov.pl — Ulga dla młodych',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
  },

  minimumWageMonthlyGrosz: {
    value: 480_600,
    quote: 'Od 1 stycznia 2026 r. minimalne wynagrodzenie za pracę wynosi 4806 zł.',
    source: MINIMUM_WAGE,
    sourceTitle:
      'Ministerstwo Rodziny, Pracy i Polityki Społecznej — Minimalne wynagrodzenie za pracę',
    effective: '2026-01-01',
    verified: VERIFIED,
  },
};
