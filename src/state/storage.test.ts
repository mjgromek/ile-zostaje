import { expect, test } from 'vitest';
import { loadEntries, saveEntries } from './storage';

// Slice 3, criterion 1: the direction is persisted with the other entries, and
// an entry written BEFORE slice 3 loads as brutto → netto rather than as an
// error. The store is faked here rather than mocked away: the fallback path
// (no storage at all) and the stored path are different branches, and only a
// real read-back proves the second one.

type Store = { [key: string]: string };

function withStore(seed: Store | null, run: () => void) {
  const store: Store = { ...(seed ?? {}) };
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    },
  });
  try {
    run();
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
}

const KEY = 'ile-zostaje.v1';

test('the direction persists, and anything written before slice 3 loads as brutto', () => {
  // A slice 2 entry: every key it knew about, and no direction.
  const beforeSlice3 = JSON.stringify({
    gross: '6000',
    contract: 'zlecenie',
    under26: true,
    student: false,
    copyright: false,
    lang: 'pl',
  });
  withStore({ [KEY]: beforeSlice3 }, () => {
    const loaded = loadEntries();
    expect(loaded.direction, 'a pre-slice-3 entry must not be an error').toBe('g2n');
    expect(loaded.gross).toBe('6000');
    expect(loaded.contract).toBe('zlecenie');
    expect(loaded.under26).toBe(true);
  });

  // A value that is not a direction is the same case: fall back, never throw.
  withStore({ [KEY]: JSON.stringify({ direction: 'sideways' }) }, () => {
    expect(loadEntries().direction).toBe('g2n');
  });

  // And the round trip: what was saved is what comes back.
  withStore(null, () => {
    saveEntries({
      gross: '4600',
      contract: 'uop',
      under26: false,
      student: false,
      copyright: false,
      lang: 'pl',
      direction: 'n2g',
      unit: 'month',
      hoursPerWeek: '40',
    });
    const loaded = loadEntries();
    expect(loaded.direction).toBe('n2g');
    expect(loaded.gross).toBe('4600');
  });
});

// Slice 4, §7. Two fields join the same namespace, validated exactly as
// `direction` was: an entry written before slice 4 has no unit and gets the one
// it was written in, which is the whole reason the key does not move.
//
// `hoursPerWeek` is persisted ALWAYS, including while the unit is not `hour`.
// It is the user's own fact about their life; losing it on a unit switch is a
// loss they did not ask for, and no test that only exercises the hour unit
// would ever see it go.
test('the unit and the hours persist, and a pre-slice-4 entry is not an error', () => {
  const beforeSlice4 = JSON.stringify({
    gross: '6000',
    contract: 'zlecenie',
    under26: true,
    student: false,
    copyright: false,
    lang: 'pl',
    direction: 'n2g',
  });
  withStore({ [KEY]: beforeSlice4 }, () => {
    const loaded = loadEntries();
    expect(loaded.unit, 'a pre-slice-4 entry was written in months').toBe('month');
    expect(loaded.hoursPerWeek, 'the field has a default, not an empty string').toBe('40');
    expect(loaded.direction, 'slice 3 must still load').toBe('n2g');
    expect(loaded.gross).toBe('6000');
  });

  // Anything that is not one of the four units is the same case: fall back.
  for (const bad of ['fortnight', '', 'HOUR', 42, null]) {
    withStore({ [KEY]: JSON.stringify({ unit: bad }) }, () => {
      expect(loadEntries().unit, `unit ${JSON.stringify(bad)}`).toBe('month');
    });
  }
  // `hoursPerWeek` is raw text, like `gross`: it is validated on the way to the
  // engine, not on the way out of storage, so anything non-string falls back and
  // an invalid string is returned as written for the field to mark invalid.
  withStore({ [KEY]: JSON.stringify({ hoursPerWeek: 999 }) }, () => {
    expect(loadEntries().hoursPerWeek).toBe('40');
  });
  withStore({ [KEY]: JSON.stringify({ hoursPerWeek: '169' }) }, () => {
    expect(loadEntries().hoursPerWeek, 'a bad entry comes back as typed').toBe('169');
  });

  // The round trip, under a unit that is not `hour`: what was saved comes back.
  withStore(null, () => {
    saveEntries({
      gross: '35',
      contract: 'uop',
      under26: false,
      student: false,
      copyright: false,
      lang: 'pl',
      direction: 'g2n',
      unit: 'week',
      hoursPerWeek: '37,5',
    });
    const loaded = loadEntries();
    expect(loaded.unit).toBe('week');
    expect(loaded.hoursPerWeek, 'the hours were dropped under a non-hour unit').toBe('37,5');
  });
});
