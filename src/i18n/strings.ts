// Polish and English are both first-class from slice one. There is no
// untranslated fallback: a key missing from a table renders as ⟦key⟧, which is
// loud on screen and is what acceptance criterion 5 looks for.

export type Lang = 'pl' | 'en';

export const LANGS: Lang[] = ['pl', 'en'];

type Table = Record<string, string>;

const pl: Table = {
  'app.name': 'Ile zostaje',
  'app.lede':
    'Wpisz, ile masz brutto. Pokażemy, ile z tego zostaje na koncie — i gdzie poszła reszta.',
  'year.chip': 'Dane za {year}',
  'year.inline': 'Stawki za rok {year}',
  'lang.legend': 'Język',
  'lang.pl': 'Polski',
  'lang.en': 'Angielski',
  'field.gross.label': 'Kwota brutto miesięcznie',
  'field.gross.unit': 'zł / mies.',
  'field.gross.quickfill': 'Płaca minimalna {year}',
  'field.contract.label': 'Rodzaj umowy',
  'contract.uop': 'Etat',
  'contract.zlecenie': 'Zlecenie',
  'contract.dzielo': 'Dzieło',
  'contract.help': 'Etat to umowa o pracę. Zlecenie i dzieło — wkrótce.',
  'field.under26.label': 'Mam mniej niż 26 lat',
  'field.under26.hint': 'Ulga dla młodych zeruje zaliczkę na PIT.',
  'answer.eyebrow': 'Na konto',
  'answer.from': 'miesięcznie, z {gross} zł brutto',
  'answer.delta.on': '+{amount} zł z ulgą dla młodych',
  'answer.delta.off': '−{amount} zł bez ulgi dla młodych',
  'answer.relief.persistent': 'Z ulgą dla młodych (PIT 0 zł).',
  'answer.live': 'Na konto: {net} zł miesięcznie.',
  'answer.live.delta': 'To o {amount} zł więcej dzięki uldze dla młodych.',
  'furniture.estimate': 'To szacunek, nie porada podatkowa.',
  'furniture.storage': 'Twoje dane zostają w tej przeglądarce — nic nie wychodzi na serwer.',
  'band.net': 'Na konto {pct}%',
  'band.left': '{gross} zł brutto',
  'band.right': 'składki i podatek {pct}%',
  'ladder.caption': 'Podział miesięcznej pensji brutto',
  'ladder.head.what': 'Skąd ta różnica',
  'ladder.head.left': 'Zostaje',
  'line.emerytalna': 'Składka emerytalna',
  'line.rentowa': 'Składka rentowa',
  'line.chorobowa': 'Składka chorobowa',
  'line.zdrowotna': 'Składka zdrowotna',
  'line.pit': 'Zaliczka na PIT',
  'line.net': 'Na konto',
  'why.simple': '{rate}% od {base} zł',
  'why.zdrowotna': '{rate}% od {base} zł — po odjęciu składek ZUS',
  'why.pit': '{rate}% od {base} zł, minus {kwota} zł kwoty zmniejszającej',
  'why.relief.chip': 'Ulga dla młodych — 0 zł',
  'total.from': 'z {gross} zł brutto',
  'sources.summary': 'Skąd te liczby?',
  'sources.intro':
    'Stawki na rok {year} z oficjalnych źródeł. Każda pozycja ma datę wejścia w życie.',
  'sources.effective': 'obowiązuje od {date}',
  'empty.answer': 'Wpisz kwotę brutto, a pokażemy, ile zostaje.',
  'empty.band': 'Tu pojawi się podział twojej pensji.',
  'error.range': 'Wpisz kwotę od 0 do 1 000 000 zł.',
  'error.digits': 'Wpisz kwotę cyframi, na przykład 6000.',
};

const en: Table = {
  'app.name': 'Ile zostaje',
  'app.lede':
    "Enter your gross pay. We'll show what actually lands in your account — and where the rest went.",
  'year.chip': '{year} rates',
  'year.inline': '{year} rates',
  'lang.legend': 'Language',
  'lang.pl': 'Polish',
  'lang.en': 'English',
  'field.gross.label': 'Monthly gross pay',
  'field.gross.unit': 'zł / month',
  'field.gross.quickfill': '{year} minimum wage',
  'field.contract.label': 'Contract type',
  'contract.uop': 'Employment',
  'contract.zlecenie': 'Zlecenie',
  'contract.dzielo': 'Dzieło',
  'contract.help': 'Employment means umowa o pracę. Zlecenie and dzieło are coming soon.',
  'field.under26.label': "I'm under 26",
  'field.under26.hint': 'The under-26 relief cuts the income-tax advance to zero.',
  'answer.eyebrow': 'In your account',
  'answer.from': 'per month, from {gross} zł gross',
  'answer.delta.on': '+{amount} zł with the under-26 relief',
  'answer.delta.off': '−{amount} zł without the under-26 relief',
  'answer.relief.persistent': 'With the under-26 relief (income tax 0 zł).',
  'answer.live': 'In your account: {net} zł per month.',
  'answer.live.delta': "That's {amount} zł more thanks to the under-26 relief.",
  'furniture.estimate': 'An estimate, not tax advice.',
  'furniture.storage': 'Your entries stay in this browser — nothing is sent to a server.',
  'band.net': 'In your account {pct}%',
  'band.left': '{gross} zł gross',
  'band.right': 'contributions and tax {pct}%',
  'ladder.caption': 'Breakdown of monthly gross pay',
  'ladder.head.what': 'Where the difference goes',
  'ladder.head.left': 'Left',
  'line.emerytalna': 'Pension contribution (emerytalna)',
  'line.rentowa': 'Disability contribution (rentowa)',
  'line.chorobowa': 'Sickness contribution (chorobowa)',
  'line.zdrowotna': 'Health contribution (zdrowotna)',
  'line.pit': 'Income-tax advance (PIT)',
  'line.net': 'In your account',
  'why.simple': '{rate}% of {base} zł',
  'why.zdrowotna': '{rate}% of {base} zł — after ZUS contributions',
  'why.pit': '{rate}% of {base} zł, minus the {kwota} zł tax-reducing amount',
  'why.relief.chip': 'Ulga dla młodych — 0 zł',
  'total.from': 'from {gross} zł gross',
  'sources.summary': 'Where do these numbers come from?',
  'sources.intro': '{year} rates from official sources. Each carries its effective date.',
  'sources.effective': 'in force from {date}',
  'empty.answer': "Enter a gross amount and we'll show what's left.",
  'empty.band': 'Your pay breakdown will appear here.',
  'error.range': 'Enter an amount between 0 and 1,000,000 zł.',
  'error.digits': 'Enter the amount in digits, for example 6000.',
};

const TABLES: Record<Lang, Table> = { pl, en };

export type Params = Record<string, string | number>;

/** A missing key is never silently blank: it renders as ⟦key⟧. */
export function t(lang: Lang, key: string, params: Params = {}): string {
  const template = TABLES[lang][key];
  if (template === undefined) return `⟦${key}⟧`;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = params[name];
    return value === undefined ? whole : String(value);
  });
}

const LOCALES: Record<Lang, string> = { pl: 'pl-PL', en: 'en-GB' };

/** Grosz to a money string in the active language. Never carries the unit. */
export function formatMoney(grosz: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    // CLDR's pl locale suppresses grouping below five digits, which would print
    // `6000,00`. Polish typographic convention groups from four, and the design
    // spec fixes `6 000,00` with a non-breaking space, so grouping is forced.
    useGrouping: 'always',
  }).format(grosz / 100);
}

/** A percentage for display only. Derived from grosz, never fed back in. */
export function formatPercent(fraction: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(fraction * 100);
}

/** A rate such as 9.76 as the page would print it. */
export function formatRate(rate: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rate);
}

export function detectLang(navigatorLanguage: string | undefined): Lang {
  return navigatorLanguage?.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}
