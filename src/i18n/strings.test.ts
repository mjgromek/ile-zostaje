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
    ['field.amount.label.gross', 'Kwota brutto miesięcznie', 'Monthly gross amount'],
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
