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
  // Slice 4, DESIGN-SLICE-4 §5. The unit is one scalar's denominator, not a mode
  // of the app, so its strings sit with the field's and not with the direction's.
  'unit.group': 'Jednostka kwoty',
  'unit.hour': 'zł / godz.',
  'unit.week': 'zł / tydz.',
  'unit.month': 'zł / mies.',
  'unit.year': 'zł / rok',
  'unit.per.hour': 'za godzinę',
  'unit.per.week': 'tygodniowo',
  'unit.per.month': 'miesięcznie',
  'unit.per.year': 'rocznie',
  // The OPERATION, never a rounded intermediate. Printing a rounded hours-per-
  // month figure and then computing 6 066,67 zł from the unrounded one leaves a
  // reader who multiplies twelve grosz short; printing the operation lets them
  // reproduce the app's own figure exactly. Load-bearing prose, not style, and
  // `units.test.ts` refuses the rounded figure anywhere in this source.
  'conv.hour': '{hours} godz. tygodniowo × 52 tyg. ÷ 12 miesięcy.',
  'conv.week': 'Tydzień × 52 ÷ 12 miesięcy — ta sama kwota co tydzień.',
  'conv.year': 'Rok ÷ 12 miesięcy — ta sama kwota co miesiąc.',
  'field.hours.label': 'Ile godzin tygodniowo?',
  'field.hours.unit': 'godz. / tydz.',
  'error.hours': 'Wpisz liczbę godzin od 1 do 168.',
  // The echo. `≈` is doing real work: it says this division does not close
  // exactly, and that the model assumes twelve identical months.
  'answer.perunit': '≈ {amount} zł na konto {per}',
  'answer.perunit.gross': '≈ {amount} zł na umowie {per}',
  'answer.live.perunit': 'Około {amount} zł {per}.',
  'note.zusCeiling':
    'Powyżej {amount} zł miesięcznie nie płacisz już składki emerytalnej i rentowej — ' +
    'roczny limit to {annual} zł. Liczymy tylko tę jedną umowę.',
  'sources.zus.ceiling': 'Roczny limit podstawy składek emerytalnej i rentowej (30-krotność)',
  // Slice 3, DESIGN-SLICE-2 §10. The direction is read before the field whose
  // meaning it changes, so its label is a verb: `Liczę: brutto → netto`.
  'dir.label': 'Liczę',
  'dir.group': 'Kierunek przeliczenia',
  'dir.g2n': 'brutto → netto',
  'dir.n2g': 'netto → brutto',
  // The period is dropped: the select states it one screen inch to the right,
  // and two places asserting it is how they drift apart.
  'field.amount.label.gross': 'Kwota brutto',
  'field.amount.label.net': 'Ile chcesz mieć na koncie',
  'dir.ambiguous':
    'Tę kwotę na koncie daje kilka kwot brutto — od {lo} zł do {hi} zł. Pokazujemy najniższą.',
  'dir.unreachable':
    'Żadna kwota brutto nie daje dokładnie tyle na konto. Najbliższa to {amount} zł.',
  // Slice 4b item 2: the label states what it is, and the click still sets the
  // amount, the unit AND the direction. The label is narrower than its effect;
  // that is recorded in DECISIONS and paid for by the chip's ink outline.
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
  'answer.eyebrow.gross': 'Kwota na umowie',
  'answer.from': 'miesięcznie, z {gross} zł brutto',
  'answer.from.net': 'miesięcznie, żeby na konto trafiło {net} zł',
  'answer.delta.on': '+{amount} zł z ulgą dla młodych',
  'answer.delta.off': '−{amount} zł bez ulgi dla młodych',
  'answer.delta.student.on': '+{amount} zł, bo studiujesz',
  'answer.delta.student.off': '−{amount} zł, gdy nie studiujesz',
  'answer.relief.persistent': 'Z ulgą dla młodych (PIT 0 zł).',
  'answer.student.persistent': 'Bez składek ZUS — student do 26 lat.',
  'answer.live': 'Na konto: {net} zł miesięcznie.',
  // The live region says the figure the SCREEN says. Announcing the typed net
  // under the other direction's eyebrow was the P1-class defect 4b fixes.
  'answer.live.gross': 'Kwota na umowie: {gross} zł miesięcznie.',
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
  // Direction-aware, because item 3 makes the empty state a RETURN state: a
  // netto user must not be told to type a gross over a field labelled
  // `Ile chcesz mieć na koncie`. `empty.band` needs no pair — the band
  // decomposes a gross either way.
  'empty.answer.net': 'Wpisz kwotę, jaką chcesz mieć na koncie, a policzymy brutto.',
  'empty.band': 'Tu pojawi się podział twojej pensji.',
  'error.range': 'Wpisz kwotę od 0 do {max} {unit}.',
  'error.digits': 'Wpisz kwotę cyframi, na przykład 6000.',
};

const en: Table = {
  'app.name': 'Ile zostaje',
  'year.chip': '{year} rates',
  'year.inline': '{year} rates',
  'lang.legend': 'Language',
  'lang.pl': 'Polish',
  'lang.en': 'English',
  'unit.group': 'Amount unit',
  'unit.hour': 'zł / hour',
  'unit.week': 'zł / week',
  'unit.month': 'zł / month',
  'unit.year': 'zł / year',
  'unit.per.hour': 'an hour',
  'unit.per.week': 'a week',
  'unit.per.month': 'a month',
  'unit.per.year': 'a year',
  'conv.hour': '{hours} h a week × 52 weeks ÷ 12 months.',
  'conv.week': 'A week × 52 ÷ 12 months — the same amount every week.',
  'conv.year': 'A year ÷ 12 months — the same amount every month.',
  'field.hours.label': 'How many hours a week?',
  'field.hours.unit': 'h / week',
  'error.hours': 'Enter a number of hours from 1 to 168.',
  'answer.perunit': '≈ {amount} zł in your account {per}',
  'answer.perunit.gross': '≈ {amount} zł on the contract {per}',
  'answer.live.perunit': 'About {amount} zł {per}.',
  'note.zusCeiling':
    'Above {amount} zł a month you stop paying the pension and disability contributions — ' +
    'the annual ceiling is {annual} zł. We count this one contract only.',
  'sources.zus.ceiling': 'Annual ceiling on the pension and disability contribution base (30×)',
  'dir.label': 'Calculating',
  'dir.group': 'Direction of the calculation',
  'dir.g2n': 'gross → net',
  'dir.n2g': 'net → gross',
  'field.amount.label.gross': 'Gross amount',
  'field.amount.label.net': 'What you want in your account',
  'dir.ambiguous':
    'Several gross amounts produce this net — from {lo} zł to {hi} zł. We show the lowest.',
  'dir.unreachable': 'No gross amount produces exactly this net. The closest is {amount} zł.',
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
  'answer.eyebrow.gross': 'Amount on the contract',
  'answer.from': 'per month, from {gross} zł gross',
  'answer.from.net': 'per month, so that {net} zł lands in your account',
  'answer.delta.on': '+{amount} zł with the under-26 relief',
  'answer.delta.off': '−{amount} zł without the under-26 relief',
  'answer.delta.student.on': '+{amount} zł because you are a student',
  'answer.delta.student.off': '−{amount} zł if you are not a student',
  'answer.relief.persistent': 'With the under-26 relief (income tax 0 zł).',
  'answer.student.persistent': 'No ZUS — student under 26.',
  'answer.live': 'In your account: {net} zł per month.',
  'answer.live.gross': 'On the contract: {gross} zł per month.',
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
  'empty.answer.net': "Enter what you want in your account and we'll work out the gross.",
  'empty.band': 'Your pay breakdown will appear here.',
  'error.range': 'Enter an amount between 0 and {max} {unit}.',
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

/**
 * Whole złote, grouped, no grosz. The quick-fill chip says `4 806 zł brutto`:
 * a statutory figure that IS a whole number of złote reads as a claim about
 * money when it is printed with two zeroes after it, and the chip is measured
 * at 248 px PL against a 264 px content box at 320 — the decimals do not fit.
 */
export function formatZloty(grosz: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], {
    maximumFractionDigits: 0,
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
