// Polish and English are both first-class from slice one. There is no
// untranslated fallback: a key missing from a table renders as ⟦key⟧, which is
// loud on screen and is what acceptance criterion 5 looks for.

export type Lang = 'pl' | 'en';

export const LANGS: Lang[] = ['pl', 'en'];

type Table = Record<string, string>;

const pl: Table = {
  'app.name': 'Ile zostaje',
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
  'q.yes': 'Tak',
  'q.no': 'Nie',
  'q.under26': 'Masz mniej niż 26 lat?',
  'q.student': 'Studiujesz?',
  'q.copyright': 'Przenosisz prawa autorskie?',
  'note.zlecenie.chorobowa': 'Bez chorobowej — przy zleceniu jest dobrowolna.',
  'note.zlecenie.student': 'Student do 26 lat — bez składek ZUS i bez zdrowotnej.',
  'note.dzielo.kup': 'Liczymy koszty uzyskania {pct}% — {amount} zł.',
  'note.dzielo.kup.cap': '50% liczy się do {amount} zł kosztów rocznie.',
  'note.dzielo.kup.condition':
    '50% należy się tylko za pracę twórczą, do której przenosisz prawa autorskie.',
  'subst.relief.dzielo':
    'Ulga dla młodych nie obejmuje umowy o dzieło — tylko etat i zlecenie. Twój wiek nic tu nie zmienia.',
  'answer.eyebrow': 'Na konto',
  'answer.from': 'miesięcznie, z {gross} zł brutto',
  'answer.delta.on': '+{amount} zł z ulgą dla młodych',
  'answer.delta.off': '−{amount} zł bez ulgi dla młodych',
  'answer.delta.student.on': '+{amount} zł, bo studiujesz',
  'answer.delta.student.off': '−{amount} zł, gdy nie studiujesz',
  'answer.relief.persistent': 'Z ulgą dla młodych (PIT 0 zł).',
  'answer.student.persistent': 'Bez składek ZUS — student do 26 lat.',
  'answer.live': 'Na konto: {net} zł miesięcznie.',
  'answer.live.delta': 'To o {amount} zł więcej dzięki uldze dla młodych.',
  'answer.live.delta.student': 'To o {amount} zł więcej, bo nie ma składek ZUS.',
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
  'line.zusOff': 'Składki ZUS',
  'line.pit': 'Zaliczka na PIT',
  'line.net': 'Na konto',
  'why.simple': '{rate}% od {base} zł',
  'why.zdrowotna': '{rate}% od {base} zł — po odjęciu składek ZUS',
  'why.zusOff': 'Student do 26 lat nie płaci składek z umowy zlecenia.',
  'why.kup.inline': '{pct}% kosztów ({amount} zł)',
  'why.pit': '{rate}% od {base} zł, minus {kwota} zł kwoty zmniejszającej',
  'why.pit.zlecenie':
    '{rate}% od {base} zł — po odjęciu {kup} i składek ZUS, minus {kwota} zł kwoty zmniejszającej',
  'why.pit.zlecenie.nozus':
    '{rate}% od {base} zł — po odjęciu {kup}, minus {kwota} zł kwoty zmniejszającej',
  'why.pit.dzielo':
    '{rate}% od {base} zł — po odjęciu {kup}, minus {kwota} zł kwoty zmniejszającej',
  'why.relief.chip': 'Ulga dla młodych — 0 zł',
  'total.from': 'z {gross} zł brutto',
  'sources.summary': 'Skąd te liczby?',
  'sources.intro':
    'Stawki na rok {year} z oficjalnych źródeł. Każda pozycja ma datę wejścia w życie.',
  'sources.effective': 'obowiązuje od {date}',
  // The provenance list names things the ladder never shows, so §7's table has
  // no key for them. Reusing `line.pit` put four different numbers under one
  // label; a list whose one job is "where did this come from" cannot do that.
  'sources.pit.rate1': 'Pierwsza stawka PIT',
  'sources.pit.rate2': 'Druga stawka PIT',
  'sources.pit.threshold': 'Próg drugiej stawki PIT (rocznie)',
  'sources.pit.reducingYear': 'Kwota zmniejszająca podatek (rocznie)',
  'sources.pit.reducingMonth': 'Kwota zmniejszająca podatek (miesięcznie)',
  'sources.pit.costs': 'Koszty uzyskania przychodu, etat (miesięcznie)',
  'sources.relief.limit': 'Limit ulgi dla młodych (rocznie)',
  'sources.relief.contracts': 'Umowy objęte ulgą dla młodych',
  'sources.zlecenie.chorobowa': 'Chorobowa przy zleceniu — dobrowolna',
  'sources.zlecenie.student': 'Student do 26 lat na zleceniu — bez ZUS',
  'sources.zlecenie.costs': 'Koszty uzyskania przychodu, zlecenie',
  'sources.dzielo.zus': 'Umowa o dzieło — poza ZUS',
  'sources.dzielo.costs': 'Koszty uzyskania przychodu, dzieło',
  'sources.dzielo.costs.copyright': 'Koszty 50% przy przeniesieniu praw autorskich',
  'sources.dzielo.costs.cap': 'Limit kosztów 50% (rocznie)',
  'empty.answer': 'Wpisz kwotę brutto, a pokażemy, ile zostaje.',
  'empty.band': 'Tu pojawi się podział twojej pensji.',
  'error.range': 'Wpisz kwotę od 0 do 1 000 000 zł.',
  'error.digits': 'Wpisz kwotę cyframi, na przykład 6000.',
};

const en: Table = {
  'app.name': 'Ile zostaje',
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
  'q.yes': 'Yes',
  'q.no': 'No',
  'q.under26': 'Are you under 26?',
  'q.student': 'Are you a student?',
  'q.copyright': 'Are you transferring copyright?',
  'note.zlecenie.chorobowa':
    'Without the sickness contribution — it is voluntary on a zlecenie.',
  'note.zlecenie.student': 'A student under 26 — no ZUS and no health contribution.',
  'note.dzielo.kup': 'Deductible costs at {pct}% — {amount} zł.',
  'note.dzielo.kup.cap': 'The 50% rate applies up to {amount} zł of costs a year.',
  'note.dzielo.kup.condition':
    'The 50% rate applies only to creative work whose copyright you transfer.',
  'subst.relief.dzielo':
    'The under-26 relief does not cover umowa o dzieło — only etat and zlecenie. Your age changes nothing here.',
  'answer.eyebrow': 'In your account',
  'answer.from': 'per month, from {gross} zł gross',
  'answer.delta.on': '+{amount} zł with the under-26 relief',
  'answer.delta.off': '−{amount} zł without the under-26 relief',
  'answer.delta.student.on': '+{amount} zł because you are a student',
  'answer.delta.student.off': '−{amount} zł if you are not a student',
  'answer.relief.persistent': 'With the under-26 relief (income tax 0 zł).',
  'answer.student.persistent': 'No ZUS — student under 26.',
  'answer.live': 'In your account: {net} zł per month.',
  'answer.live.delta': "That's {amount} zł more thanks to the under-26 relief.",
  'answer.live.delta.student': 'That is {amount} zł more, because there is no ZUS.',
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
  'line.zusOff': 'ZUS contributions',
  'line.pit': 'Income-tax advance (PIT)',
  'line.net': 'In your account',
  'why.simple': '{rate}% of {base} zł',
  'why.zdrowotna': '{rate}% of {base} zł — after ZUS contributions',
  'why.zusOff': 'A student under 26 pays no contributions on a zlecenie.',
  'why.kup.inline': '{pct}% deductible costs ({amount} zł)',
  'why.pit': '{rate}% of {base} zł, minus the {kwota} zł tax-reducing amount',
  'why.pit.zlecenie':
    '{rate}% of {base} zł — after {kup} and ZUS, minus the {kwota} zł tax-reducing amount',
  'why.pit.zlecenie.nozus':
    '{rate}% of {base} zł — after {kup}, minus the {kwota} zł tax-reducing amount',
  'why.pit.dzielo':
    '{rate}% of {base} zł — after {kup}, minus the {kwota} zł tax-reducing amount',
  'why.relief.chip': 'Under-26 relief — 0 zł',
  'total.from': 'from {gross} zł gross',
  'sources.summary': 'Where do these numbers come from?',
  'sources.intro': '{year} rates from official sources. Each carries its effective date.',
  'sources.effective': 'in force from {date}',
  'sources.pit.rate1': 'First income-tax rate',
  'sources.pit.rate2': 'Second income-tax rate',
  'sources.pit.threshold': 'Second-rate threshold (annual)',
  'sources.pit.reducingYear': 'Tax-reducing amount (annual)',
  'sources.pit.reducingMonth': 'Tax-reducing amount (monthly)',
  'sources.pit.costs': 'Deductible costs, employment (monthly)',
  'sources.relief.limit': 'Under-26 relief limit (annual)',
  'sources.relief.contracts': 'Contracts the under-26 relief covers',
  'sources.zlecenie.chorobowa': 'Sickness contribution on a zlecenie — voluntary',
  'sources.zlecenie.student': 'A student under 26 on a zlecenie — no ZUS',
  'sources.zlecenie.costs': 'Deductible costs, zlecenie',
  'sources.dzielo.zus': 'Umowa o dzieło — outside ZUS',
  'sources.dzielo.costs': 'Deductible costs, dzieło',
  'sources.dzielo.costs.copyright': 'The 50% rate for transferred copyright',
  'sources.dzielo.costs.cap': 'Annual cap on 50% costs',
  'empty.answer': "Enter a gross amount and we'll show what's left.",
  'empty.band': 'Your pay breakdown will appear here.',
  'error.range': 'Enter an amount between 0 and 1,000,000 zł.',
  'error.digits': 'Enter the amount in digits, for example 6000.',
};

/** Exported so a test can walk every key rather than the ones a screen visits. */
export const TABLES: Record<Lang, Table> = { pl, en };

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
