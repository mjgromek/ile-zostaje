import { expect, test } from 'vitest';
import { LANGS, TABLES, t, type Lang } from './strings';

// Criterion 7: both languages are complete for every string. On screen a
// missing key renders as ⟦key⟧, which the browser tests look for — but only on
// the states they happen to visit. This walks every key in both tables, so a
// string that only appears on the dzieło screen at 50% cannot hide.

test('both language tables carry exactly the same keys, none of them empty', () => {
  const [first, ...rest] = LANGS as [Lang, ...Lang[]];
  const reference = Object.keys(TABLES[first]).sort();

  for (const lang of rest) {
    expect(Object.keys(TABLES[lang]).sort(), `${lang} does not match ${first}`).toEqual(reference);
  }

  for (const lang of LANGS) {
    for (const key of reference) {
      expect(TABLES[lang][key]?.trim().length, `${lang}: ${key} is empty`).toBeGreaterThan(0);
      // The same interpolation slots must exist in both, or one language
      // silently prints a placeholder or drops a number.
      const slots = (table: Record<string, string>) =>
        (table[key]?.match(/\{(\w+)\}/g) ?? []).sort().join(',');
      expect(slots(TABLES[lang]), `${lang}: ${key} interpolates differently`).toBe(
        slots(TABLES[first]),
      );
    }
  }
});

// Identical keys are not a translated table: `why.relief.chip` shipped Polish
// into the EN build and survived a release, because parity counts keys and a
// browser test only sees the states it visits. The exceptions are deliberate
// and few, so they are named here — anything else identical in both tables is
// a string nobody translated.
const PL_IN_EN = new Set([
  // The product's own name, not a phrase.
  'app.name',
  // Two legal contract types keep their Polish names in the EN build; the
  // helper text glosses them.
  'contract.zlecenie',
  'contract.dzielo',
]);

test('no English string is its Polish original, outside a named allowlist', () => {
  const untranslated = Object.keys(TABLES.pl).filter(
    (key) => TABLES.en[key] === TABLES.pl[key] && !PL_IN_EN.has(key),
  );
  expect(untranslated, 'these keys render Polish on the English screen').toEqual([]);

  // An allowlist that outlives its entries is the next silent leak: every name
  // on it must still exist and still be identical.
  for (const key of PL_IN_EN) {
    expect(TABLES.pl[key], `${key} is allowlisted but gone`).toBeDefined();
    expect(TABLES.en[key], `${key} is allowlisted but now differs`).toBe(TABLES.pl[key]);
  }
});

// Slice 3, criterion 7: the direction toggle's strings ship verbatim from
// DESIGN-SLICE-2 §10, in both languages. Parity above proves both tables carry
// the same keys; only the table itself proves they carry the agreed words, and
// a paraphrase of a settled string is a reopened spec.
test('the slice 3 direction strings are the ones §10 settled, in both languages', () => {
  const settled: [key: string, pl: string, en: string][] = [
    ['dir.label', 'Liczę', 'Calculating'],
    ['dir.group', 'Kierunek przeliczenia', 'Direction of the calculation'],
    ['dir.g2n', 'brutto → netto', 'gross → net'],
    ['dir.n2g', 'netto → brutto', 'net → gross'],
    // `field.amount.label.gross` was settled here by slice 3 and is RE-settled
    // by slice 4 §5, which drops the period from it. It moves to the slice 4
    // table below rather than being asserted twice with two different strings.
    ['field.amount.label.net', 'Ile chcesz mieć na koncie', 'What you want in your account'],
    ['answer.eyebrow.gross', 'Kwota na umowie', 'Amount on the contract'],
    [
      'answer.from.net',
      'miesięcznie, żeby na konto trafiło {net} zł',
      'per month, so that {net} zł lands in your account',
    ],
    [
      'dir.ambiguous',
      'Tę kwotę na koncie daje kilka kwot brutto — od {lo} zł do {hi} zł. Pokazujemy najniższą.',
      'Several gross amounts produce this net — from {lo} zł to {hi} zł. We show the lowest.',
    ],
    [
      'dir.unreachable',
      'Żadna kwota brutto nie daje dokładnie tyle na konto. Najbliższa to {amount} zł.',
      'No gross amount produces exactly this net. The closest is {amount} zł.',
    ],
  ];
  for (const [key, plText, enText] of settled) {
    expect(TABLES.pl[key], `pl: ${key}`).toBe(plText);
    expect(TABLES.en[key], `en: ${key}`).toBe(enText);
  }
});

// The lede is CUT, all three contracts, both languages, and nothing replaces
// it. `contract.help` said "wkrótce", which is now false. The under-26 switch
// became a question, so its label and hint went with it. A deleted key that
// survives in a table is a string waiting to be rendered again.
test('the strings slice 2 deletes are gone from both tables', () => {
  const deleted = ['app.lede', 'contract.help', 'field.under26.label', 'field.under26.hint'];
  for (const lang of LANGS) {
    for (const key of deleted) {
      expect(TABLES[lang][key], `${lang}: ${key} still exists`).toBeUndefined();
      expect(t(lang, key)).toBe(`⟦${key}⟧`);
    }
  }
});

// Slice 4, criterion 9. DESIGN-SLICE-4 §5's table, verbatim, in both languages.
// Parity above proves the two tables carry the same keys; only this proves they
// carry the agreed words. A paraphrase of a settled string is a reopened spec,
// and `conv.*` in particular is load-bearing prose: it prints the OPERATION, so
// a translator who "tidied" it into a rounded intermediate would put the lie
// back on the screen without changing a single number.
test('the slice 4 unit strings are the ones §5 settled, in both languages', () => {
  const settled: [key: string, pl: string, en: string][] = [
    ['unit.group', 'Jednostka kwoty', 'Amount unit'],
    ['unit.hour', 'zł / godz.', 'zł / hour'],
    ['unit.week', 'zł / tydz.', 'zł / week'],
    ['unit.month', 'zł / mies.', 'zł / month'],
    ['unit.year', 'zł / rok', 'zł / year'],
    ['unit.per.hour', 'za godzinę', 'an hour'],
    ['unit.per.week', 'tygodniowo', 'a week'],
    ['unit.per.month', 'miesięcznie', 'a month'],
    ['unit.per.year', 'rocznie', 'a year'],
    [
      'conv.hour',
      '{hours} godz. tygodniowo × 52 tyg. ÷ 12 miesięcy.',
      '{hours} h a week × 52 weeks ÷ 12 months.',
    ],
    [
      'conv.week',
      'Tydzień × 52 ÷ 12 miesięcy — ta sama kwota co tydzień.',
      'A week × 52 ÷ 12 months — the same amount every week.',
    ],
    [
      'conv.year',
      'Rok ÷ 12 miesięcy — ta sama kwota co miesiąc.',
      'A year ÷ 12 months — the same amount every month.',
    ],
    ['field.hours.label', 'Ile godzin tygodniowo?', 'How many hours a week?'],
    ['field.hours.unit', 'godz. / tydz.', 'h / week'],
    ['error.hours', 'Wpisz liczbę godzin od 1 do 168.', 'Enter a number of hours from 1 to 168.'],
    ['answer.perunit', '≈ {amount} zł na konto {per}', '≈ {amount} zł in your account {per}'],
    [
      'answer.perunit.gross',
      '≈ {amount} zł na umowie {per}',
      '≈ {amount} zł on the contract {per}',
    ],
    ['answer.live.perunit', 'Około {amount} zł {per}.', 'About {amount} zł {per}.'],
    [
      'note.zusCeiling',
      'Powyżej {amount} zł miesięcznie nie płacisz już składki emerytalnej i rentowej — ' +
        'roczny limit to {annual} zł. Liczymy tylko tę jedną umowę.',
      'Above {amount} zł a month you stop paying the pension and disability contributions — ' +
        'the annual ceiling is {annual} zł. We count this one contract only.',
    ],
    [
      'sources.zus.ceiling',
      'Roczny limit podstawy składek emerytalnej i rentowej (30-krotność)',
      'Annual ceiling on the pension and disability contribution base (30×)',
    ],
    // CHANGED. The label drops "miesięcznie" / "Monthly": the select now states
    // the period one screen inch to the right, and two places asserting it is
    // how they drift apart.
    ['field.amount.label.gross', 'Kwota brutto', 'Gross amount'],
    [
      'field.gross.quickfill',
      'Płaca minimalna {year} — {amount} zł brutto',
      '{year} minimum wage — {amount} zł gross',
    ],
    ['error.range', 'Wpisz kwotę od 0 do {max} {unit}.', 'Enter an amount between 0 and {max} {unit}.'],
  ];
  for (const [key, plText, enText] of settled) {
    expect(TABLES.pl[key], `pl: ${key}`).toBe(plText);
    expect(TABLES.en[key], `en: ${key}`).toBe(enText);
  }

  // The conversion line never prints a rounded intermediate — 173,33 h a month
  // and then 6 066,67 zł leaves a reader who multiplies 12 grosz short. Both
  // tables, both the sentence that has an hours slot and the two that do not.
  for (const lang of LANGS) {
    for (const key of ['conv.hour', 'conv.week', 'conv.year']) {
      expect(TABLES[lang][key], `${lang}: ${key} prints a rounded intermediate`).not.toMatch(
        /173/,
      );
    }
    expect(TABLES[lang]['conv.hour'], `${lang}: conv.hour must print × 52`).toContain('52');
    expect(TABLES[lang]['conv.week'], `${lang}: conv.week must print × 52`).toContain('52');
  }

  // DIES — deleted, not deprecated. `field.gross.label` rendered nowhere since
  // slice 3; `field.gross.unit`'s one consumer is the span the select replaces.
  for (const lang of LANGS) {
    for (const key of ['field.gross.label', 'field.gross.unit']) {
      expect(TABLES[lang][key], `${lang}: ${key} still exists`).toBeUndefined();
      expect(t(lang, key)).toBe(`⟦${key}⟧`);
    }
  }
});
