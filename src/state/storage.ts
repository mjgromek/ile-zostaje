import type { ContractKind } from '../engine/rates';
import { detectLang, type Lang } from '../i18n/strings';

// The only place user data is ever written. It is this browser's localStorage
// and nothing else: no server, no cookie, no analytics. The screen says so, in
// the active language, and acceptance criterion 7 checks the network log.

const KEY = 'ile-zostaje.v1';

const CONTRACTS: ContractKind[] = ['uop', 'zlecenie', 'dzielo'];

export type Entries = {
  gross: string;
  contract: ContractKind;
  under26: boolean;
  student: boolean;
  copyright: boolean;
  lang: Lang;
};

export function loadEntries(): Entries {
  const fallback: Entries = {
    gross: '',
    contract: 'uop',
    under26: false,
    student: false,
    copyright: false,
    lang: detectLang(globalThis.navigator?.language),
  };
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (!raw) return fallback;
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
    };
  } catch {
    // A corrupted or unavailable store must not take the screen down with it.
    return fallback;
  }
}

export function saveEntries(entries: Entries): void {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Private mode, quota, disabled storage: the calculator still works.
  }
}
