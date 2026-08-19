import type { ContractKind } from '../engine/rates';
import { detectLang, type Lang } from '../i18n/strings';
import { DEFAULT_HOURS_PER_WEEK, UNITS, type Unit } from './units';

// The only place user data is ever written. It is this browser's localStorage
// and nothing else: no server, no cookie, no analytics. The screen says so, in
// the active language, and acceptance criterion 7 checks the network log.

const KEY = 'ile-zostaje.v1';

const CONTRACTS: ContractKind[] = ['uop', 'zlecenie', 'dzielo'];

/** Which way the amount is read: brutto → netto, or netto → brutto. */
export type Direction = 'g2n' | 'n2g';

const DIRECTIONS: Direction[] = ['g2n', 'n2g'];

export type Entries = {
  gross: string;
  contract: ContractKind;
  under26: boolean;
  student: boolean;
  copyright: boolean;
  lang: Lang;
  direction: Direction;
  unit: Unit;
  /**
   * The raw text, like `gross`. Persisted ALWAYS, including while the unit is
   * not `hour`: it is the user's own fact about their life, and losing it on a
   * unit switch is a loss they did not ask for.
   */
  hoursPerWeek: string;
};

/**
 * What a browser with no record of its own opens on. A worked example, not a
 * claim about the user: visible, editable and obviously round. It survives
 * exactly one page load, because the write-on-mount effect turns the first
 * paint into a record — so there is no second first run.
 */
export const FIRST_RUN_GROSS = '5000';

export function loadEntries(): Entries {
  const fallback: Entries = {
    gross: '',
    contract: 'uop',
    under26: false,
    student: false,
    copyright: false,
    lang: detectLang(globalThis.navigator?.language),
    direction: 'g2n',
    unit: 'month',
    hoursPerWeek: DEFAULT_HOURS_PER_WEEK,
  };
  // Declared outside the try so the catch can tell the two failures apart: a
  // record we never obtained is a first run, and a record we obtained and could
  // not read is somebody's entry we must not write over. The distinction is
  // drawn on the RAW string, because the parsed field cannot carry it — "no
  // record" and "a record whose amount is empty" both arrive as ''.
  let raw: string | null | undefined;
  try {
    raw = globalThis.localStorage?.getItem(KEY) ?? null;
    if (raw === null || raw === '') return { ...fallback, gross: FIRST_RUN_GROSS };
    const parsed = JSON.parse(raw) as Partial<Entries>;
    const flag = (value: unknown, fall: boolean) => (typeof value === 'boolean' ? value : fall);
    return {
      gross: typeof parsed.gross === 'string' ? parsed.gross : fallback.gross,
      // An entry written before slice 2 has no contract, and defaults to the
      // one it was written on. That is why the key namespace does not change.
      contract: CONTRACTS.includes(parsed.contract as ContractKind)
        ? (parsed.contract as ContractKind)
        : fallback.contract,
      under26: flag(parsed.under26, fallback.under26),
      student: flag(parsed.student, fallback.student),
      copyright: flag(parsed.copyright, fallback.copyright),
      lang: parsed.lang === 'pl' || parsed.lang === 'en' ? parsed.lang : fallback.lang,
      // An entry written before slice 3 has no direction, and one written by
      // hand may have anything. Both are the same case: brutto → netto is what
      // the app opens on, never an error and never a thrown-away entry.
      direction: DIRECTIONS.includes(parsed.direction as Direction)
        ? (parsed.direction as Direction)
        : fallback.direction,
      // An entry written before slice 4 has no unit and gets the unit it was
      // written in — a month — which is why the key namespace does not move.
      unit: UNITS.includes(parsed.unit as Unit) ? (parsed.unit as Unit) : fallback.unit,
      // Validated on the way to the engine, not on the way out of storage: a
      // bad value comes back as typed so the field can mark itself invalid and
      // the person can see what they wrote. Only a non-string falls back.
      hoursPerWeek:
        typeof parsed.hoursPerWeek === 'string' ? parsed.hoursPerWeek : fallback.hoursPerWeek,
    };
  } catch {
    // A corrupted or unavailable store must not take the screen down with it.
    // `fallback.gross` stays '': a record that failed to parse is a person's
    // own entry, and handing them an example instead is inventing their number.
    return raw === undefined ? { ...fallback, gross: FIRST_RUN_GROSS } : fallback;
  }
}

export function saveEntries(entries: Entries): void {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Private mode, quota, disabled storage: the calculator still works.
  }
}
