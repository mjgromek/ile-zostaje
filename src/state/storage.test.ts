import { expect, test } from 'vitest';
import { loadEntries, saveEntries } from './storage';

// Slice 3, criterion 1: the direction is persisted with the other entries, and
// an entry written BEFORE slice 3 loads as brutto → netto rather than as an
// error. The store is faked here rather than mocked away: the fallback path
// (no storage at all) and the stored path are different branches, and only a
// real read-back proves the second one.

type Store = { [key: string]: string };

function withStore(seed: Store | null, run: () => void, getItem?: (key: string) => string | null) {
  const store: Store = { ...(seed ?? {}) };
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: getItem ?? ((key: string) => store[key] ?? null),
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

// Slice 4b, criterion 5. The first run is decided on the RAW string, before
// JSON.parse, because "no record at all" and "a record whose amount is empty"
// are two different facts about a person and the parsed field cannot tell them
// apart: both arrive as ''. Neither existing test above covers this — both seed
// a record, so both take the parse path and never see the branch.
//
// `5000` is the stakeholder's own figure (DECISIONS, 2026-08-19), written as a
// literal here rather than imported, so the constant and the assertion cannot
// agree with each other by construction.
test('a first run is told from a cleared field on the raw string, never the parsed one', () => {
  // 1. No record at all: the worked example.
  withStore(null, () => {
    expect(loadEntries().gross, 'a browser with no record must open on 5000').toBe('5000');
  });

  // 3. A record whose amount is empty. They cleared the field; the prefill is
  //    NOT theirs to hand back, and the rest of their entry still loads.
  withStore({ [KEY]: JSON.stringify({ gross: '', direction: 'n2g', unit: 'week' }) }, () => {
    const loaded = loadEntries();
    expect(loaded.gross, 'a cleared field came back as 5000').toBe('');
    expect(loaded.direction, 'the rest of the record must still load').toBe('n2g');
    expect(loaded.unit).toBe('week');
  });

  // 4. A record that cannot be parsed is somebody's entry we could not read.
  //    Overwriting it with an example would be inventing their number.
  withStore({ [KEY]: '{"gross": "6000"' }, () => {
    expect(loadEntries().gross, 'an unreadable record was written over').toBe('');
  });

  // The other side of the same catch: a store that THREW on the way in was
  // never obtained, so nothing of anybody's is at stake and it is a first run.
  withStore(
    null,
    () => {
      expect(loadEntries().gross, 'a store that cannot be read at all is a first run').toBe('5000');
    },
    () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    },
  );

  // 2. A record with an amount is untouched, which is the whole point.
  withStore({ [KEY]: JSON.stringify({ gross: '6000' }) }, () => {
    expect(loadEntries().gross).toBe('6000');
  });

  // An empty STRING under the key is the same case as no key: nothing was
  // recorded. It is separate from `gross: ''`, which is a recorded emptiness.
  withStore({ [KEY]: '' }, () => {
    expect(loadEntries().gross).toBe('5000');
  });
});
