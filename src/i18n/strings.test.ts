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
