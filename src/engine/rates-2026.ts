import type { YearRates } from './rates';

// Rates for the 2026 tax year — umowa o pracę, umowa zlecenia and umowa o
// dzieło — employee-financed share.
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
const ZUS_ANNUAL_BASE =
  'https://www.zus.pl/baza-wiedzy/skladki-wskazniki-odsetki/wskazniki/roczna-podstawa-wymiaru-skladek-na-ubezpieczenia-emerytalne-i-rentowe-od-1999-r';
const PIT_SCALE =
  'https://www.podatki.gov.pl/podatki-firmowe/pit/informacje-podstawowe/co-jest-opodatkowane/opodatkowanie-wedlug-skali-podatkowej';
const PIT_WORK =
  'https://www.podatki.gov.pl/podatki-osobiste/pit/informacje-podstawowe/co-jest-opodatkowane/dochody-z-pracy';
const PIT_2 =
  'https://www.podatki.gov.pl/poradniki-i-informatory/pit-2-pit-2a-pit-3-zasady-skladania-oswiadczen-o-stosowaniu-pomniejszenia-zaliczki-o-kwote-zmniejszajaca-podatek-112-124-lub-136';
const YOUTH_RELIEF = 'https://www.podatki.gov.pl/ulgi-i-odliczenia/ulga-dla-mlodych-pit';
const MINIMUM_WAGE = 'https://www.gov.pl/web/rodzina/minimalne-wynagrodzenie-za-prace';
const ZUS_CIVIL = 'https://www.zus.pl/-/umowy-cywilnoprawne-w-ubezpieczeniach-spolecznych';
const PIT_CIVIL =
  'https://www.podatki.gov.pl/podatki-osobiste/pit/informacje-podstawowe/co-jest-opodatkowane/dochody-z-umowy-zlecenia-lub-o-dzielo';
const PIT_COPYRIGHT =
  'https://www.podatki.gov.pl/podatki-osobiste/pit/informacje-podstawowe/co-jest-opodatkowane/dochody-z-praw-autorskich';

// Every page below was re-fetched and re-read on this date, including the eight
// slice 1 already cited: a citation that passed once is not a citation that is
// still true. The frozen passages in rates-2026.test.ts came from the same run.
const VERIFIED = '2026-08-18';

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
      // The page prints this as a lead-in and two list items, the second ending
      // in a comma. It ends in a comma here too: the sentence is the page's.
      quote:
        'Składki na ubezpieczenia rentowe finansujecie: Ty – w wysokości 1,5 proc. podstawy wymiaru, Twój płatnik składek – w wysokości 6,5 proc. podstawy wymiaru,',
      source: ZUS_FINANCING,
      sourceTitle: 'ZUS — Finansowanie składek na ubezpieczenia społeczne',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
    chorobowa: {
      value: 2.45,
      // The second half of this quote used to say who finances the składka.
      // True, and printed — on the sibling financing page, not this one. A
      // quote is evidence for the page beside it or it is nothing.
      // A list item in the rates table, and it ends in a comma there.
      quote: 'na ubezpieczenie chorobowe – 2,45% podstawy wymiaru,',
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
    // The limit 30-krotności. DESIGN-SLICE-4 §8 carried 282 600 zł as INFERRED
    // from a web-search summary; this was read off the ZUS page itself on the
    // date below, which is the whole of what PROJECT.md's invariant asks for.
    // The page is a list of every year since 1999 and names the obwieszczenie
    // each figure comes from, so the quote carries the year and MP 2025 poz.
    // 1206 with it — a figure without its year is not a citation, it is a
    // number that happens to be on a page.
    annualBaseCeilingGrosz: {
      value: 28_260_000, // 282 600,00 zł a year — 23 550,00 zł a month, exactly
      quote: '282 600,00 zł - kwota rocznego ograniczenia podstawy w 2026 r. (MP 2025.1206)',
      source: ZUS_ANNUAL_BASE,
      sourceTitle:
        'ZUS — Roczna podstawa wymiaru składek na ubezpieczenia emerytalne i rentowe od 1999 r.',
      effective: '2026-01-01',
      verified: '2026-08-19',
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
      // Was a hand-rebuilt version of the scale table on Dochody z pracy: the
      // words were the page's, the punctuation and the layout were not. The
      // threshold is stated as one sentence on the skala page, so cite that.
      quote:
        'Stawka podatku uzależniona jest od wysokości uzyskanego dochodu i wynosi: 12% dla podstawy obliczenia podatku do wysokości 120 000 zł',
      source: PIT_SCALE,
      sourceTitle: 'podatki.gov.pl — Opodatkowanie według skali podatkowej',
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
      // P2-6: the quote used to stop at "3000 zł", which printed a limit that
      // holds for ONE employment relationship as an absolute one. The page
      // prints the condition in the same sentence, so the quote carries it.
      quote:
        'W 2026 roku zryczałtowane koszty uzyskania przychodów z pracy wynoszą: 250 zł miesięcznie, a za rok podatkowy łącznie nie więcej niż: 3000 zł - w przypadku uzyskiwania przychodów z jednego stosunku pracy,',
      source: PIT_WORK,
      sourceTitle: 'podatki.gov.pl — Dochody z pracy',
      effective: '2026-01-01',
      verified: VERIFIED,
    },
  },

  // What changes when the contract is not umowa o pracę. Each of these is a
  // RULE, and each is cited, because the engine reads them instead of
  // branching on a contract name.
  contracts: {
    zlecenie: {
      chorobowaVoluntary: {
        value: true,
        quote:
          'Wykonujesz umowę zlecenia bądź umowę o świadczenie usług? Obejmiemy Cię ubezpieczeniami: emerytalnym, rentowymi, wypadkowym i zdrowotnym. Ubezpieczenie chorobowe jest dobrowolne.',
        source: ZUS_CIVIL,
        sourceTitle: 'ZUS — Umowy zlecenia i umowy o dzieło w ubezpieczeniach społecznych',
        effective: '2026-01-01',
        verified: VERIFIED,
      },
      studentUnder26Exempt: {
        value: true,
        quote:
          'Nie obejmiemy Cię ubezpieczeniami, jeśli jesteś uczniem lub studentem i nie skończyłeś 26 lat.',
        source: ZUS_CIVIL,
        sourceTitle: 'ZUS — Umowy zlecenia i umowy o dzieło w ubezpieczeniach społecznych',
        effective: '2026-01-01',
        verified: VERIFIED,
      },
      costsPercent: {
        value: 20,
        quote:
          'Do przychodów z umów zlecenia/o dzieło możesz zastosować koszty uzyskania przychodów ustalone według normy procentowej w wysokości 20% uzyskanego przychodu, pomniejszonego o potrącone przez płatnika z Twoich środków w danym miesiącu składki na ubezpieczenia społeczne, których podstawę wymiaru stanowi ten przychód.',
        source: PIT_CIVIL,
        sourceTitle: 'podatki.gov.pl — Dochody z umowy zlecenia lub o dzieło',
        effective: '2026-01-01',
        verified: VERIFIED,
      },
    },
    dzielo: {
      outsideZus: {
        value: true,
        quote:
          'Zawarłeś umowę o dzieło? Nie obejmiemy Cię ubezpieczeniami społecznymi i ubezpieczeniem zdrowotnym ani obowiązkowo, ani dobrowolnie.',
        source: ZUS_CIVIL,
        sourceTitle: 'ZUS — Umowy zlecenia i umowy o dzieło w ubezpieczeniach społecznych',
        effective: '2026-01-01',
        verified: VERIFIED,
      },
      costsPercent: {
        value: 20,
        quote:
          'Do przychodów z umów zlecenia/o dzieło możesz zastosować koszty uzyskania przychodów ustalone według normy procentowej w wysokości 20% uzyskanego przychodu, pomniejszonego o potrącone przez płatnika z Twoich środków w danym miesiącu składki na ubezpieczenia społeczne, których podstawę wymiaru stanowi ten przychód.',
        source: PIT_CIVIL,
        sourceTitle: 'podatki.gov.pl — Dochody z umowy zlecenia lub o dzieło',
        effective: '2026-01-01',
        verified: VERIFIED,
      },
      copyrightCostsPercent: {
        value: 50,
        quote:
          'Do przychodów z praw autorskich i pokrewnych możesz zastosować koszty uzyskania przychodów w wysokości 50% uzyskanego przychodu.',
        source: PIT_COPYRIGHT,
        sourceTitle: 'podatki.gov.pl — Dochody z praw autorskich',
        effective: '2026-01-01',
        verified: VERIFIED,
      },
      copyrightCostsAnnualCapGrosz: {
        // 120 000 zł, the same number as pit.thresholdAnnualGrosz above and NOT
        // the same fact. Two sentences on two pages that happen to agree; an
        // alias would move both the day one of them changes.
        value: 12_000_000,
        quote:
          '50% koszty uzyskania przychodów ze wszystkich tytułów nie mogą przekroczyć w roku podatkowym kwoty 120 000 zł.',
        source: PIT_COPYRIGHT,
        sourceTitle: 'podatki.gov.pl — Dochody z praw autorskich',
        effective: '2026-01-01',
        verified: VERIFIED,
      },
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
    // The list is the source's, narrowed to the contract types this app offers:
    // the page also names praktyka absolwencka, staż uczniowski and zasiłek
    // macierzyński, which are not contracts a user can pick here. Umowa o
    // dzieło is absent from the page, which is why the screen says so.
    contracts: {
      value: ['uop', 'zlecenie'],
      quote:
        'Ulga obejmuje przychody z: pracy na etacie (umowa o pracę, stosunek służbowy, praca nakładcza, spółdzielczy stosunek pracy), umowy zlecenia zawartej przez osobę fizyczną z: podmiotem prowadzącym działalność gospodarczą, właścicielem (posiadaczem) nieruchomości, w której lokale są wynajmowane lub działającym w jego imieniu zarządcą albo administratorem – jeżeli usługi są wykonywane wyłącznie dla potrzeb związanych z tą nieruchomością albo przedsiębiorstwem w spadku, Pamiętaj! Ulga nie dotyczy przychodów uzyskanych na podstawie umów o zarządzanie przedsiębiorstwem, kontraktów menedżerskich lub umów o podobnym charakterze. tytułu odbywania praktyki absolwenckiej , o której mowa w ustawie z dnia 17 lipca 2009 r. o praktykach absolwenckich, tytułu odbywania stażu uczniowskiego , o którym mowa w art. 121a ustawy z dnia 14 grudnia 2016 r. – Prawo oświatowe, zasiłku macierzyńskiego , o którym mowa w ustawie z dnia 25 czerwca 1999 r. o świadczeniach pieniężnych z ubezpieczenia społecznego w razie choroby i macierzyństwa.',
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
