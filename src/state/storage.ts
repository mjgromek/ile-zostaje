import { detectLang, type Lang } from '../i18n/strings';

// The only place user data is ever written. It is this browser's localStorage
// and nothing else: no server, no cookie, no analytics. The screen says so, in
// the active language, and acceptance criterion 7 checks the network log.

const KEY = 'ile-zostaje.v1';

export type Entries = {
  gross: string;
  under26: boolean;
  lang: Lang;
};

export function loadEntries(): Entries {
  const fallback: Entries = {
    gross: '',
    under26: false,
    lang: detectLang(globalThis.navigator?.language),
  };
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Entries>;
    return {
      gross: typeof parsed.gross === 'string' ? parsed.gross : fallback.gross,
      under26: typeof parsed.under26 === 'boolean' ? parsed.under26 : fallback.under26,
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
