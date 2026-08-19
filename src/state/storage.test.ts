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
    });
    const loaded = loadEntries();
    expect(loaded.direction).toBe('n2g');
    expect(loaded.gross).toBe('4600');
  });
});
