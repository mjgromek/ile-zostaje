/**
 * The most a MONTH may hold. It is what bounds the reverse solver's work, and
 * since slice 4 the amount is not necessarily monthly: the caller passes this
 * cap recomputed into the active unit, so an hourly rate is bounded by what it
 * comes to in a month rather than by what it looks like on its own.
 */
export const MAX_GROSS_GROSZ = 100_000_000; // 1 000 000 zł

export type GrossInput =
  | { kind: 'empty' }
  | { kind: 'error'; error: 'digits' | 'range' }
  | { kind: 'ok'; grosz: number };

/**
 * What the person typed, turned into grosz. Accepts a comma or a dot for the
 * decimal, and any whitespace as a thousands group — including the non-breaking
 * space pl-PL formatting produces, so a value pasted back in still parses.
 */
export function parseGross(text: string, maxGrosz: number = MAX_GROSS_GROSZ): GrossInput {
  const trimmed = text.trim();
  if (trimmed === '') return { kind: 'empty' };

  const normalised = trimmed.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(normalised)) return { kind: 'error', error: 'digits' };

  const grosz = Math.round(Number(normalised) * 100);
  if (!Number.isFinite(grosz) || grosz > maxGrosz) return { kind: 'error', error: 'range' };
  return { kind: 'ok', grosz };
}
