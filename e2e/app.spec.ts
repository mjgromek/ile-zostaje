import { expect, test, type Page } from '@playwright/test';
import { V030_SCREENS } from './v030-screens';

// Slice 1's criteria 1, 3, 5, 6 and 7 and slice 2's criteria 1, 2, 3 and 4,
// driven in a real browser against the running app. The checker drives the
// artifact, not the diff.

// Slice 4 §5 drops the period from both: the unit select now states it, one
// screen inch to the right, and two places asserting it is how they drift apart.
const GROSS_LABEL_PL = 'Kwota brutto';
const GROSS_LABEL_EN = 'Gross amount';
const Q_UNDER26 = 'Masz mniej niż 26 lat?';
const Q_STUDENT = 'Studiujesz?';
const Q_COPYRIGHT = 'Przenosisz prawa autorskie?';

/** pl-PL groups thousands with a non-breaking space. Compare on digits only. */
function digits(text: string | null): string {
  return (text ?? '').replace(/[^\d,.-]/g, '');
}

async function enterGross(page: Page, value: string) {
  const input = page.getByLabel(GROSS_LABEL_PL);
  await input.fill(value);
}

/** A Nie/Tak question. Scoped to its group: three of them say "Tak". */
function answer(page: Page, question: string, value: 'Nie' | 'Tak') {
  return page.getByRole('radiogroup', { name: question }).getByRole('radio', { name: value });
}

function contract(page: Page, name: 'Etat' | 'Zlecenie' | 'Dzieło') {
  return page.getByTestId('contract-bar').getByRole('radio', { name });
}

test('criterion 1 — a monthly gross gives one net figure that updates live', async ({ page }) => {
  await page.goto('/');
  // A marker that a full page load would wipe out.
  await page.evaluate(() => {
    (window as unknown as { __noReload?: boolean }).__noReload = true;
  });

  await enterGross(page, '6000');
  const net = page.getByTestId('net-amount');
  await expect(net).toHaveText(/4\D?420,43/);

  await enterGross(page, '4806');
  await expect(net).toHaveText(/3\D?605,85/);

  const survived = await page.evaluate(
    () => (window as unknown as { __noReload?: boolean }).__noReload === true,
  );
  expect(survived).toBe(true);
});

test('criterion 3 — the under-26 answer changes the net and zeroes the tax line', async ({
  page,
}) => {
  await page.goto('/');
  await enterGross(page, '6000');

  const net = page.getByTestId('net-amount');
  const pit = page.getByTestId('line-pit-amount');

  await expect(net).toHaveText(/4\D?420,43/);
  expect(digits(await pit.textContent())).toContain('291,00');

  await answer(page, Q_UNDER26, 'Tak').click();

  await expect(net).toHaveText(/4\D?711,43/);
  await expect(pit).toContainText('0 zł');
  await expect(page.getByText('Ulga dla młodych — 0 zł')).toBeVisible();

  await answer(page, Q_UNDER26, 'Nie').click();
  await expect(net).toHaveText(/4\D?420,43/);
});

test('criterion 5 — the language switch renders the whole screen in both languages', async ({
  page,
}) => {
  await page.goto('/');
  await enterGross(page, '6000');

  const body = page.locator('body');
  await expect(body).toContainText('Rodzaj umowy');
  await expect(body).toContainText(Q_UNDER26);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');

  await page.getByRole('radio', { name: 'Angielski' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(body).toContainText('Contract type');
  await expect(body).toContainText('Are you under 26?');
  await expect(body).toContainText('Pension contribution');
  // Two legal contract types keep their Polish names in the EN build. This is
  // the one deliberate exception, glossed in the helper text.
  await expect(body).toContainText('Zlecenie');
  await expect(body).toContainText('Dzieło');

  // A missing key renders as ⟦key⟧, so its absence is the assertion.
  await expect(body).not.toContainText('⟦');

  await page.getByRole('radio', { name: 'Polish' }).click();
  await expect(body).toContainText('Rodzaj umowy');
  await expect(body).not.toContainText('⟦');

  // The lede is CUT, both languages, and nothing replaced it.
  await expect(body).not.toContainText('Wpisz, ile masz brutto.');
  await expect(body).not.toContainText('Enter your gross pay.');
});

test('criterion 6 — the screen says it is an estimate and where the entries live', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByText('To szacunek, nie porada podatkowa.')).toBeVisible();
  await expect(
    page.getByText('Twoje dane zostają w tej przeglądarce — nic nie wychodzi na serwer.'),
  ).toBeVisible();

  await page.getByRole('radio', { name: 'Angielski' }).click();

  await expect(page.getByText('An estimate, not tax advice.')).toBeVisible();
  await expect(
    page.getByText('Your entries stay in this browser — nothing is sent to a server.'),
  ).toBeVisible();
});

test('criterion 7 — entries survive a reload and nothing leaves the device', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://localhost:5173')) foreign.push(request.url());
  });

  await page.goto('/');
  await enterGross(page, '4806');
  await answer(page, Q_UNDER26, 'Tak').click();
  await expect(page.getByTestId('net-amount')).toHaveText(/3\D?773,85/);

  await page.reload();

  await expect(page.getByLabel(GROSS_LABEL_PL)).toHaveValue('4806');
  await expect(answer(page, Q_UNDER26, 'Tak')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('net-amount')).toHaveText(/3\D?773,85/);

  expect(foreign).toEqual([]);
});

// ── slice 2 ──────────────────────────────────────────────────────────────────

test('slice 2, criterion 1 — all three contracts are selectable and recompute live', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    (window as unknown as { __noReload?: boolean }).__noReload = true;
  });
  await enterGross(page, '6000');

  const net = page.getByTestId('net-amount');

  // Umowa o pracę must still return exactly what v0.1.0 returned.
  await expect(contract(page, 'Etat')).toHaveAttribute('aria-checked', 'true');
  await expect(net).toHaveText(/4\D?420,43/);

  await contract(page, 'Zlecenie').click();
  await expect(net).toHaveText(/4\D?634,20/);

  await contract(page, 'Dzieło').click();
  await expect(net).toHaveText(/5\D?724,00/);

  await contract(page, 'Etat').click();
  await expect(net).toHaveText(/4\D?420,43/);

  const survived = await page.evaluate(
    () => (window as unknown as { __noReload?: boolean }).__noReload === true,
  );
  expect(survived).toBe(true);
});

test('slice 2, criterion 2 — a student under 26 on a zlecenie pays no ZUS at all', async ({
  page,
}) => {
  await page.goto('/');
  await enterGross(page, '6000');
  await contract(page, 'Zlecenie').click();
  await answer(page, Q_UNDER26, 'Tak').click();

  const net = page.getByTestId('net-amount');

  // State one: the contributions are there, in the band and in the ladder.
  await expect(answer(page, Q_STUDENT, 'Nie')).toHaveAttribute('aria-checked', 'true');
  await expect(net).toHaveText(/4\D?845,20/);
  await expect(page.getByTestId('line-emerytalna')).toBeVisible();
  await expect(page.getByTestId('line-zdrowotna')).toBeVisible();
  await expect(page.getByTestId('band-emerytalna')).toBeAttached();

  // The why-line has to add up on paper: the base it names and the koszty it
  // names must come from the same subtraction.
  await expect(page.getByTestId('line-pit')).toContainText(/20% kosztów \(1\D?064,88 zł\)/);

  // State two: every ZUS line is gone from both, and the net has risen to match.
  await answer(page, Q_STUDENT, 'Tak').click();

  await expect(net).toHaveText(/6\D?000,00/);
  for (const key of ['emerytalna', 'rentowa', 'chorobowa', 'zdrowotna']) {
    await expect(page.getByTestId(`line-${key}`)).toHaveCount(0);
    await expect(page.getByTestId(`band-${key}`)).toHaveCount(0);
  }
  // Collapsed to one row carrying the reason, never a silent absence.
  await expect(page.getByTestId('line-zusOff')).toContainText('Składki ZUS');
  await expect(page.getByTestId('line-zusOff')).toContainText(
    'Student do 26 lat nie płaci składek z umowy zlecenia.',
  );
  await expect(page.getByTestId('line-zusOff-amount')).toContainText('0 zł');

  // The exemption is cited on the page, with the sentence ZUS prints.
  await page.getByTestId('sources').locator('summary').click();
  await expect(page.getByTestId('sources')).toContainText(
    'Nie obejmiemy Cię ubezpieczeniami, jeśli jesteś uczniem lub studentem i nie skończyłeś 26 lat.',
  );
  await expect(
    page.getByTestId('sources').getByRole('link', { name: /Umowy zlecenia i umowy o dzieło/ }).first(),
  ).toHaveAttribute('href', 'https://www.zus.pl/-/umowy-cywilnoprawne-w-ubezpieczeniach-spolecznych');
});

test('slice 2, criterion 3 — dzieło has no ZUS and its costs are 20% or 50%', async ({ page }) => {
  await page.goto('/');
  await enterGross(page, '6000');
  await contract(page, 'Dzieło').click();

  const net = page.getByTestId('net-amount');
  await expect(net).toHaveText(/5\D?724,00/);

  // No contribution exists on this contract, so no row and no band segment.
  for (const key of ['emerytalna', 'rentowa', 'chorobowa', 'zdrowotna', 'zusOff']) {
    await expect(page.getByTestId(`line-${key}`)).toHaveCount(0);
    await expect(page.getByTestId(`band-${key}`)).toHaveCount(0);
  }

  // The 50% rate is offered as the condition that earns it, not as a rate.
  const copyright = page.getByRole('radiogroup', { name: Q_COPYRIGHT });
  await expect(copyright).toBeVisible();
  await expect(copyright).not.toContainText('50');
  await expect(page.getByTestId('consequences')).toContainText(/20% — 1\D?200,00 zł/);

  await answer(page, Q_COPYRIGHT, 'Tak').click();

  await expect(net).toHaveText(/5\D?940,00/);
  await expect(page.getByTestId('consequences')).toContainText(/50% — 3\D?000,00 zł/);
  // The annual cap is printed from the data file, not from a branch.
  await expect(page.getByTestId('consequences')).toContainText(
    /50% liczy się do 120\D?000,00 zł kosztów rocznie\./,
  );
  await expect(page.getByTestId('consequences')).toContainText(
    '50% należy się tylko za pracę twórczą',
  );

  // And it bites: 50% of 30 000 zł is 15 000 zł, capped to 10 000 zł a month.
  await enterGross(page, '30000');
  await expect(net).toHaveText(/25\D?900,00/);
});

test('slice 2, criterion 4 — the relief covers the contracts its source lists', async ({ page }) => {
  await page.goto('/');
  await enterGross(page, '6000');
  await contract(page, 'Dzieło').click();
  await answer(page, Q_UNDER26, 'Tak').click();

  // The control stays live and the screen says the answer changes nothing,
  // rather than disabling it or silently ignoring it.
  await expect(answer(page, Q_UNDER26, 'Tak')).toBeEnabled();
  await expect(page.getByTestId('net-amount')).toHaveText(/5\D?724,00/);
  await expect(page.getByTestId('note-substitution')).toContainText(
    'Ulga dla młodych nie obejmuje umowy o dzieło — tylko etat i zlecenie.',
  );

  await page.getByRole('radio', { name: 'Angielski' }).click();
  await expect(page.getByTestId('note-substitution')).toContainText(
    'The under-26 relief does not cover umowa o dzieło',
  );

  // On a zlecenie the same answer does change the result, and the note goes.
  await page.getByRole('radio', { name: 'Polish' }).click();
  await contract(page, 'Zlecenie').click();
  await expect(page.getByTestId('note-substitution')).toHaveCount(0);
  await expect(page.getByTestId('net-amount')).toHaveText(/4\D?845,20/);
});

test('P1-A — the delta chip never prices the relief on a contract it does not cover', async ({
  page,
}) => {
  // Criterion 4 on screen rather than in the engine: the note two blocks below
  // says the relief does not cover umowa o dzieło, so no chip may claim the
  // answer was worth money there. The net is the arbiter — it does not move.
  await page.goto('/');
  await enterGross(page, '6000');
  await contract(page, 'Dzieło').click();

  const net = page.getByTestId('net-amount');
  const chip = page.getByTestId('delta-chip');
  await expect(net).toHaveText(/5\D?724,00/);

  for (const value of ['Tak', 'Nie'] as const) {
    await answer(page, Q_UNDER26, value).click();
    await expect(answer(page, Q_UNDER26, value)).toHaveAttribute('aria-checked', 'true');
    // The chip lives for six seconds, so a settle far shorter than that is
    // enough to catch one: absence asserted immediately would pass on a race.
    await page.waitForTimeout(300);
    await expect(net).toHaveText(/5\D?724,00/);
    await expect(chip, `chip shown after answering "${value}" on dzieło`).toHaveCount(0);
  }

  // Control: on umowa o pracę the same answer really does move the net, so the
  // chip must appear there. Without this the test would pass on a chip that
  // never renders at all.
  await contract(page, 'Etat').click();
  await answer(page, Q_UNDER26, 'Tak').click();
  await expect(net).toHaveText(/4\D?711,43/);
  await expect(chip).toHaveText(/291,00/);
});

/** Scrolls the control into view and measures it where it will be clicked. */
async function target(locator: ReturnType<Page['locator']>) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('control has no box');
  return box;
}

test('P1-1 — every control takes a click across the 44 px the spec promises', async ({ page }) => {
  // DESIGN-SLICE-1 §6 and DESIGN-SLICE-2 §8: all targets >=44x44, contract bar
  // segments 52, Nie/Tak segments 44x56. A container that measures 44 while the
  // control inside it takes no click is the exact failure mode here, so every
  // assertion below is a real mouse click at the declared edge, backed by the
  // box measurement. The box alone would have passed the quick-fill chip.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const gross = page.getByLabel(GROSS_LABEL_PL);
  const row = await page.locator('#gross').evaluate((el) => {
    const rect = (el.parentElement as HTMLElement).getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  const grossBox = await target(gross);
  expect(grossBox.height).toBeGreaterThanOrEqual(44);
  await page.mouse.click(row.x + row.width / 2, row.y + 4);
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('gross');

  const quick = page.getByRole('button', { name: /Płaca minimalna/ });
  const quickBox = await target(quick);
  expect(quickBox.height).toBeGreaterThanOrEqual(44);
  expect(quickBox.width).toBeGreaterThanOrEqual(44);
  await page.mouse.click(quickBox.x + quickBox.width / 2, quickBox.y + 4);
  await expect(gross).toHaveValue('4806');

  const zlecenie = contract(page, 'Zlecenie');
  const contractBox = await target(zlecenie);
  expect(contractBox.height).toBeGreaterThanOrEqual(52);
  await page.mouse.click(contractBox.x + contractBox.width / 2, contractBox.y + 4);
  await expect(zlecenie).toHaveAttribute('aria-checked', 'true');

  const yes = answer(page, Q_UNDER26, 'Tak');
  const yesBox = await target(yes);
  expect(yesBox.height).toBeGreaterThanOrEqual(44);
  expect(yesBox.width).toBeGreaterThanOrEqual(56);
  await page.mouse.click(yesBox.x + yesBox.width / 2, yesBox.y + 4);
  await expect(yes).toHaveAttribute('aria-checked', 'true');

  const summary = page.getByTestId('sources').locator('summary');
  const summaryBox = await target(summary);
  expect(summaryBox.height).toBeGreaterThanOrEqual(44);
  await page.mouse.click(summaryBox.x + 24, summaryBox.y + 4);
  await expect(page.getByTestId('sources')).toHaveAttribute('open', '');

  const english = page.getByRole('radio', { name: 'Angielski' });
  const langBox = await target(english);
  expect(langBox.height).toBeGreaterThanOrEqual(44);
  expect(langBox.width).toBeGreaterThanOrEqual(44);
  await page.mouse.click(langBox.x + langBox.width / 2, langBox.y + 4);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

/**
 * The label sits between the value span and the meta span as bare text, so the
 * direct text children of each `<li>` ARE the label. No test hook is added for
 * this: a hook would let the label be right in the DOM and wrong on screen.
 */
async function provenance(page: Page): Promise<{ value: string; label: string }[]> {
  return page.locator('[data-testid="sources"] li').evaluateAll((items) =>
    items.map((item) => ({
      value: (item.querySelector('span')?.textContent ?? '').trim(),
      label: Array.from(item.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent ?? '')
        .join('')
        .trim(),
    })),
  );
}

test('P2-3 — every entry in the provenance list names what it actually is', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('sources').locator('summary').click();

  const pl = await provenance(page);
  // 21 since slice 4: the annual ZUS ceiling is a cited rate, so it is in the
  // data file and therefore in this list. A rate the app applies and does not
  // show the source for is exactly what this list exists to make impossible.
  expect(pl).toHaveLength(21);
  // Four different numbers under one label is the defect: a reader opening the
  // disclosure to find where 250 zł came from was told "Zaliczka na PIT".
  expect(new Set(pl.map((entry) => entry.label)).size).toBe(21);
  // pl-PL groups with a non-breaking space, so the value is matched on digits.
  const labelFor = (list: { value: string; label: string }[], amount: string) =>
    list.find((entry) => digits(entry.value) === amount)?.label;

  expect(labelFor(pl, '250,00')).toMatch(/Koszty uzyskania przychodu/);
  expect(labelFor(pl, '85528,00')).toMatch(/ulgi dla młodych/);

  await page.getByRole('radio', { name: 'Angielski' }).click();

  const en = await provenance(page);
  expect(new Set(en.map((entry) => entry.label)).size).toBe(21);
  expect(labelFor(en, '250.00')).toMatch(/Deductible costs/);
  // Criterion 5 holds for the keys this fix adds, in both tables.
  await expect(page.getByTestId('sources')).not.toContainText('⟦');
});

/** A Nie/Tak question in the English build. */
function answerEn(page: Page, question: string, value: 'No' | 'Yes') {
  return page.getByRole('radiogroup', { name: question }).getByRole('radio', { name: value });
}

test('P1-E — a chip earned on one contract never survives onto another', async ({ page }) => {
  // The chip prices an answer against what is on screen. Switch contract inside
  // its six-second life and the screen underneath it changed: on dzieło the note
  // two blocks below says the relief does not cover this contract at all.
  await page.goto('/');
  await enterGross(page, '6000');

  const net = page.getByTestId('net-amount');
  const chip = page.getByTestId('delta-chip');

  // Earned on etat, where it is true — and the control for the whole test.
  await answer(page, Q_UNDER26, 'Tak').click();
  await expect(net).toHaveText(/4\D?711,43/);
  await expect(chip).toHaveText(/291,00/);

  await contract(page, 'Dzieło').click();
  await expect(net).toHaveText(/5\D?724,00/);
  await expect(page.getByTestId('note-substitution')).toBeVisible();
  await expect(chip, 'the etat chip carried onto dzieło').toHaveCount(0);

  // The student chip reaches dzieło by the same path, and dzieło has no student
  // control at all. It must still fire on zlecenie, where it is true.
  await contract(page, 'Zlecenie').click();
  await answer(page, Q_STUDENT, 'Tak').click();
  await expect(net).toHaveText(/6\D?000,00/);
  await expect(chip).toHaveText(/1\D?154,80/);

  await contract(page, 'Dzieło').click();
  await expect(net).toHaveText(/5\D?724,00/);
  await expect(chip, 'the student chip carried onto dzieło').toHaveCount(0);

  // Both languages: the same carry-over, and the same truthful chip before it.
  await page.getByRole('radio', { name: 'Angielski' }).click();
  await page.getByTestId('contract-bar').getByRole('radio', { name: 'Employment' }).click();
  await answerEn(page, 'Are you under 26?', 'No').click();
  // en-GB groups and points the other way round: 4,420.43.
  await expect(net).toHaveText(/4\D?420\.43/);
  await expect(chip).toHaveText(/291\.00/);

  await contract(page, 'Dzieło').click();
  await expect(chip, 'the English chip carried onto dzieło').toHaveCount(0);
});

test('P1-E — a chip stops claiming a figure the entry has moved past', async ({ page }) => {
  // Wider than contracts: the relief is worth a different amount at 20 000 zł,
  // so a chip that names 291,00 is false of what is now on screen.
  await page.goto('/');
  await enterGross(page, '6000');

  const net = page.getByTestId('net-amount');
  const chip = page.getByTestId('delta-chip');

  await answer(page, Q_UNDER26, 'Tak').click();
  await expect(net).toHaveText(/4\D?711,43/);
  await expect(chip).toHaveText(/291,00/);

  await enterGross(page, '20000');
  await expect(net).not.toHaveText(/4\D?711,43/);
  await expect(chip, 'the 6 000 zł chip survived the entry becoming 20 000 zł').toHaveCount(0);
});

// P1-F. DESIGN-SLICE-2 §8: "contract, student and copyright changes announce
// immediately, one utterance each, never debounced." Latency is measured in the
// page, from the event's own timestamp — a round trip through the test runner
// would be counted as announcement delay.

type Utterance = { dt: number; text: string };
type ProbeWindow = { __t0: number; __live: { t: number; text: string }[] };

/** Announced at once means well inside the 500 ms typing debounce. */
const IMMEDIATE_MS = 250;

// The selector is a parameter because slice 3 puts a second role="status" on
// the page — the field's ambiguity slot — and it comes first in the DOM. The
// default is what every slice 1 and 2 test already measured.
async function installLiveProbe(page: Page, selector = '[role="status"]') {
  await page.evaluate((where) => {
    const w = window as unknown as ProbeWindow;
    const region = document.querySelector(where);
    if (region === null) throw new Error(`no live region matching ${where} on the page`);
    w.__t0 = performance.now();
    w.__live = [];
    let last = region.textContent ?? '';
    new MutationObserver(() => {
      const text = region.textContent ?? '';
      if (text === last) return;
      last = text;
      w.__live.push({ t: performance.now(), text });
    }).observe(region, { childList: true, characterData: true, subtree: true });
    const mark = () => {
      w.__t0 = performance.now();
      w.__live = [];
    };
    document.addEventListener('click', mark, true);
    document.addEventListener('input', mark, true);
  }, selector);
}

/** Every non-empty text the live region held since the last click or keystroke. */
async function utterances(page: Page, settleMs = 1_200): Promise<Utterance[]> {
  await page.waitForTimeout(settleMs);
  return page.evaluate(() => {
    const w = window as unknown as ProbeWindow;
    return w.__live
      .filter((entry) => entry.text.trim() !== '')
      .map((entry) => ({ dt: entry.t - w.__t0, text: entry.text }));
  });
}

function latency(said: Utterance[]): number {
  return said[0]?.dt ?? Number.POSITIVE_INFINITY;
}

function announcedAtOnce(said: Utterance[], what: string) {
  expect(said, `${what}: ${said.length} utterances, not one — ${JSON.stringify(said)}`).toHaveLength(
    1,
  );
  expect(latency(said), `${what} reached the live region after ${latency(said)} ms`).toBeLessThan(
    IMMEDIATE_MS,
  );
}

test('P1-F — contract, student and copyright announce at once, one utterance each', async ({
  page,
}) => {
  await page.goto('/');
  await enterGross(page, '6000');
  const live = page.getByRole('status');
  await expect(live).toHaveText(/4\D?420,43/);
  await installLiveProbe(page);

  // The two that already announce at once. They are the control: the same
  // instrument reads both the fast and the slow controls on the same page.
  await answer(page, Q_UNDER26, 'Tak').click();
  announcedAtOnce(await utterances(page), 'the under-26 answer');

  await contract(page, 'Zlecenie').click();
  announcedAtOnce(await utterances(page), 'a contract change');

  await answer(page, Q_STUDENT, 'Tak').click();
  announcedAtOnce(await utterances(page), 'the student answer');

  await contract(page, 'Dzieło').click();
  announcedAtOnce(await utterances(page), 'a contract change onto dzieło');

  await answer(page, Q_COPYRIGHT, 'Tak').click();
  announcedAtOnce(await utterances(page), 'the copyright answer');
});

test('P1-F — typing is still debounced, so no keystroke is its own utterance', async ({ page }) => {
  // The failure mode on the other side: announcing immediately everywhere reads
  // every keystroke aloud. The debounce must survive the fix.
  await page.goto('/');
  await enterGross(page, '6000');
  await expect(page.getByRole('status')).toHaveText(/4\D?420,43/);
  await installLiveProbe(page);

  const input = page.getByLabel(GROSS_LABEL_PL);
  await input.fill('');
  await input.pressSequentially('20000', { delay: 20 });

  const said = await utterances(page);
  expect(said, `typing said ${said.length} things, not one — ${JSON.stringify(said)}`).toHaveLength(
    1,
  );
  expect(latency(said), `typing announced after ${latency(said)} ms`).toBeGreaterThan(400);
  expect(latency(said), `typing announced after ${latency(said)} ms`).toBeLessThan(900);
});

// P1-J. The chip is read off the screen on both sides of the flip, because an
// engine number that is right proves nothing about what the chip prints — that
// gap is exactly how four cycles read this as correct. Every figure below is the
// relief's worth, hand-derived in .agent/LAST_CHECK.md from rates-2026.ts.
type ChipCase = { gross: string; pl: RegExp; en: RegExp };

// 7 127,33 zł/month is the relief's limit. Below it the relief cancels the whole
// advance, so the two coincide; above it the advance is the larger number and
// the chip must still print the relief's worth.
const CHIP_CASES: ChipCase[] = [
  { gross: '6000', pl: /291,00/, en: /291\.00/ },
  { gross: '10318', pl: /738,00/, en: /738\.00/ },
  { gross: '12000', pl: /759,00/, en: /759\.00/ },
  { gross: '20000', pl: /1\D?968,00/, en: /1,968\.00/ },
];

const CHIP_CASES_ZLECENIE: ChipCase[] = [
  { gross: '6000', pl: /211,00/, en: /211\.00/ },
  { gross: '10318', pl: /579,00/, en: /579\.00/ },
  { gross: '12000', pl: /607,00/, en: /607\.00/ },
  { gross: '20000', pl: /1\D?446,00/, en: /1,446\.00/ },
];

/** Tak then Nie, reading the chip after each. Same number, opposite sign. */
async function bothSidesOfTheFlip(
  page: Page,
  cases: ChipCase[],
  lang: 'pl' | 'en',
  where: string,
) {
  const chip = page.getByTestId('delta-chip');
  const yes = lang === 'pl' ? 'Tak' : 'Yes';
  const no = lang === 'pl' ? 'Nie' : 'No';
  const question = lang === 'pl' ? Q_UNDER26 : 'Are you under 26?';
  const grossLabel = lang === 'pl' ? GROSS_LABEL_PL : GROSS_LABEL_EN;
  const radio = (value: string) =>
    page.getByRole('radiogroup', { name: question }).getByRole('radio', { name: value });

  for (const useCase of cases) {
    const amount = lang === 'pl' ? useCase.pl : useCase.en;
    await page.getByLabel(grossLabel).fill(useCase.gross);
    // A new amount clears the standing chip, so each case starts from nothing.
    await expect(chip).toHaveCount(0);

    await radio(yes).click();
    await expect(chip, `${where} ${useCase.gross}, Tak`).toHaveText(
      new RegExp(`^\\+${amount.source}`),
    );

    await radio(no).click();
    await expect(chip, `${where} ${useCase.gross}, Nie`).toHaveText(
      new RegExp(`^−${amount.source}`),
    );
  }
}

test('P1-J — the Nie chip prices the relief, not the whole PIT advance', async ({ page }) => {
  await page.goto('/');

  await bothSidesOfTheFlip(page, CHIP_CASES, 'pl', 'uop pl');
  await contract(page, 'Zlecenie').click();
  await bothSidesOfTheFlip(page, CHIP_CASES_ZLECENIE, 'pl', 'zlecenie pl');

  await page.getByRole('radio', { name: 'Angielski' }).click();
  await bothSidesOfTheFlip(page, CHIP_CASES_ZLECENIE, 'en', 'zlecenie en');
  await page.getByTestId('contract-bar').getByRole('radio', { name: 'Employment' }).click();
  await bothSidesOfTheFlip(page, CHIP_CASES, 'en', 'uop en');

  // The off-list guard stays: dzieło is not on the cited list, so the answer is
  // worth nothing and no chip appears on either side of the flip.
  await contract(page, 'Dzieło').click();
  await page.getByLabel(GROSS_LABEL_EN).fill('12000');
  await answerEn(page, 'Are you under 26?', 'Yes').click();
  await expect(page.getByTestId('delta-chip')).toHaveCount(0);
  await answerEn(page, 'Are you under 26?', 'No').click();
  await expect(page.getByTestId('delta-chip')).toHaveCount(0);
});

// ── slice 3 — the brutto/netto direction toggle ───────────────────────────────
//
// Every figure below was measured with the SHIPPED engine before the slice was
// written (scratchpad probe against `computeContract`, 15:00–15:20), so a test
// that agrees with the screen and with the engine is not agreeing with itself:
//   uop, net 4 600,00  <- gross 6 263,06 … 6 264,35, five values, lowest first
//   uop, net 8 488,87  <- gross 11 998,73 (Nie) and 10 885,69 (Tak)
//   uop, top reachable net 511 491,00 at the 1 000 000 zł input cap
//   student under 26 on a zlecenie is exactly 1:1

const NET_LABEL_PL = 'Ile chcesz mieć na koncie';
const DIRECTION_PL = 'Kierunek przeliczenia';

function direction(page: Page, which: 'g2n' | 'n2g') {
  return page.getByRole('radiogroup', { name: DIRECTION_PL }).getByTestId(`dir-${which}`);
}

/** The amount field, whose label — and meaning — depend on the direction. */
function amountField(page: Page) {
  return page.locator('input#gross');
}

test('slice 3, criterion 1 — the direction row is above the amount label and is remembered', async ({
  page,
}) => {
  await page.goto('/');

  const group = page.getByRole('radiogroup', { name: DIRECTION_PL });
  await expect(group).toBeVisible();
  await expect(direction(page, 'g2n')).toHaveAttribute('aria-checked', 'true');
  await expect(direction(page, 'n2g')).toHaveAttribute('aria-checked', 'false');

  // Read before the field whose meaning it changes: above the label, and in the
  // same card as the amount — not a page-level mode bar.
  const label = page.getByText(GROSS_LABEL_PL, { exact: true });
  const rowBox = (await group.boundingBox())!;
  const labelBox = (await label.boundingBox())!;
  expect(rowBox.y + rowBox.height, 'the direction row is not above the amount label').toBeLessThanOrEqual(
    labelBox.y,
  );
  await expect(page.locator('section', { has: group }).locator('input#gross')).toHaveCount(1);

  // §8's floor on the new row, and §3's arrow inside each segment.
  for (const which of ['g2n', 'n2g'] as const) {
    const box = (await direction(page, which).boundingBox())!;
    expect(box.height, `${which} is ${box.height} px tall`).toBeGreaterThanOrEqual(44);
    await expect(direction(page, which).locator('[aria-hidden="true"]')).toHaveText('→');
  }

  await direction(page, 'n2g').click();
  await expect(page.getByText(NET_LABEL_PL, { exact: true })).toBeVisible();
  await page.reload();
  await expect(direction(page, 'n2g')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText(NET_LABEL_PL, { exact: true })).toBeVisible();

  // An entry written before slice 3 knows nothing about a direction, and loads
  // as brutto rather than as an error.
  await page.evaluate(() => {
    localStorage.setItem(
      'ile-zostaje.v1',
      JSON.stringify({ gross: '6000', contract: 'uop', under26: false, student: false, copyright: false, lang: 'pl' }),
    );
  });
  await page.reload();
  await expect(direction(page, 'g2n')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('net-amount')).toHaveText(/4\D?420,43/);
});

test('slice 3, criterion 2 — netto mode changes the words, never the arithmetic', async ({
  page,
}) => {
  await page.goto('/');
  await enterGross(page, '6263,06');
  await expect(page.getByTestId('net-amount')).toHaveText(/4\D?600,00/);
  const ladderInGross = await page.getByTestId('ladder').textContent();
  const bandInGross = await page.getByTestId('band').textContent();

  // The direction REINTERPRETS what was typed: it does not convert it and does
  // not throw it away.
  await direction(page, 'n2g').click();
  await expect(amountField(page)).toHaveValue('6263,06');

  await amountField(page).fill('4600');
  await expect(page.getByTestId('net-amount')).toHaveText(/6\D?263,06/);
  await expect(page.getByText('Kwota na umowie')).toBeVisible();
  await expect(page.getByText(/miesięcznie, żeby na konto trafiło 4\D?600,00 zł/)).toBeVisible();

  // Band, ladder and total row are the same screen the gross produced.
  expect(await page.getByTestId('ladder').textContent()).toBe(ladderInGross);
  expect(await page.getByTestId('band').textContent()).toBe(bandInGross);
  await expect(page.getByText('To szacunek, nie porada podatkowa.')).toBeVisible();
  await expect(
    page.getByText('Twoje dane zostają w tej przeglądarce — nic nie wychodzi na serwer.'),
  ).toBeVisible();
});

test('slice 3, criterion 5 — ambiguity and unreachability are stated, never as an error', async ({
  page,
}) => {
  await page.goto('/');
  await direction(page, 'n2g').click();
  await amountField(page).fill('4600');

  // Five gross values give 4 600,00 zł on uop; the lowest is shown and the
  // spread is named, in the field's status slot.
  await expect(page.getByTestId('net-amount')).toHaveText(/6\D?263,06/);
  const status = page.getByTestId('amount-status');
  await expect(status).toHaveAttribute('role', 'status');
  await expect(status).toHaveText(/od 6\D?263,06 zł do 6\D?264,35 zł/);
  // Ambiguity is not an error: the field is never marked invalid for it.
  await expect(amountField(page)).not.toHaveAttribute('aria-invalid', 'true');

  // Above the top reachable net nothing is exact, and the closest gross is the
  // cap the field itself allows.
  await amountField(page).fill('600000');
  await expect(status).toHaveText(/Najbliższa to 1\D?000\D?000,00 zł/);

  // A student under 26 on a zlecenie is exactly 1:1, so neither message fires.
  await contract(page, 'Zlecenie').click();
  await answer(page, Q_UNDER26, 'Tak').click();
  await answer(page, Q_STUDENT, 'Tak').click();
  await amountField(page).fill('6000');
  await expect(page.getByTestId('net-amount')).toHaveText(/6\D?000,00/);
  await expect(status).toHaveCount(0);
});

// Criterion 6, the P1-J family in the new mode: at a net produced by a gross
// above the relief's monthly limit, the chip must price the relief at the gross
// now on screen — never the whole PIT advance, and never a figure from the
// gross the other answer solved to.
type NetCase = { contract: 'Etat' | 'Zlecenie'; net: string; gross: RegExp; worth: RegExp; advance: RegExp };

const NETTO_CHIP_CASES: NetCase[] = [
  { contract: 'Etat', net: '8488,87', gross: /10\D?885,69/, worth: /738,00/, advance: /797,00/ },
  { contract: 'Etat', net: '12561,78', gross: /16\D?860,83/, worth: /1\D?598,00/, advance: /2\D?276,00/ },
  { contract: 'Zlecenie', net: '8968,41', gross: /11\D?159,17/, worth: /608,00/, advance: /651,00/ },
  { contract: 'Zlecenie', net: '13907,68', gross: /17\D?997,61/, worth: /1\D?163,00/, advance: /1\D?789,00/ },
];

test('slice 3, criterion 6 — in netto mode every figure is computed on the answer shown', async ({
  page,
}) => {
  await page.goto('/');
  await direction(page, 'n2g').click();

  for (const useCase of NETTO_CHIP_CASES) {
    const where = `${useCase.contract} netto ${useCase.net}`;
    await contract(page, useCase.contract).click();
    await answer(page, Q_UNDER26, 'Nie').click();
    await amountField(page).fill(useCase.net);

    await answer(page, Q_UNDER26, 'Tak').click();
    await expect(page.getByTestId('net-amount'), `${where}: solved gross`).toHaveText(useCase.gross);
    const chip = page.getByTestId('delta-chip');
    await expect(chip, `${where}: the chip`).toHaveText(useCase.worth);
    await expect(chip, `${where}: the chip printed the whole PIT advance`).not.toHaveText(
      useCase.advance,
    );
  }
});

test('slice 3, criterion 10 — a direction change announces at once, one utterance', async ({
  page,
}) => {
  await page.goto('/');
  await enterGross(page, '6263,06');
  await expect(page.getByTestId('live')).toHaveText(/4\D?600,00/);
  await installLiveProbe(page, '[data-testid="live"]');

  await direction(page, 'n2g').click();
  announcedAtOnce(await utterances(page), 'a direction change');

  await direction(page, 'g2n').click();
  announcedAtOnce(await utterances(page), 'a direction change back');
});

test('slice 3, criterion 8 — clear, answer, retype: one utterance and no stale chip', async ({
  page,
}) => {
  // P2-G and P2-I, one root cause: the announce ref and the delta ref survived
  // the result going null. Clear-and-retype is the ordinary gesture now that
  // the direction reinterprets the amount, so both close here.
  await page.goto('/');
  await enterGross(page, '6000');
  await expect(page.getByTestId('live')).toHaveText(/4\D?420,43/);
  await installLiveProbe(page, '[data-testid="live"]');

  await amountField(page).fill('');
  await answer(page, Q_UNDER26, 'Tak').click();
  // One input event, so the probe's window opens once: the entry either
  // announces at once, which is the answered-a-question path firing on a
  // keystroke, or it debounces, which is what typing is supposed to do.
  await amountField(page).fill('6000');

  // The chip is read first, and on a short leash. It stands for six seconds by
  // design, so the default five-second retry would simply outlive it and pass
  // on a chip that was there the whole time.
  const said = await utterances(page);
  await expect(
    page.getByTestId('delta-chip'),
    'a chip priced an answer flipped on a field with no result on screen',
  ).toHaveCount(0, { timeout: 1_000 });
  expect(said, `retyping said ${said.length} things, not one — ${JSON.stringify(said)}`).toHaveLength(1);
  expect(
    latency(said),
    `retyping announced after ${latency(said)} ms — the stale announced state made a keystroke read as an answer`,
  ).toBeGreaterThan(400);
});

// ── slice 4 — the amount's unit: hour, week, month, year ──────────────────────
//
// Every monthly figure below is a multiple of 5,20 zł, because that is the step
// at which a month is exactly representable in all four units (week is ×52 ÷ 12,
// hour at 40 h/week is ×3 ÷ 520). Round-looking amounts would compare screens
// that are one or two grosz apart and call the difference a regression.
//
//   6 000,80 zł/mies. = 34,62 zł/godz. @ 40 h = 1 384,80 zł/tydz. = 72 009,60/rok
//  12 001,60 zł/mies. = 69,24 zł/godz. @ 40 h = 2 769,60 zł/tydz. = 144 019,20/rok
//  19 999,20 zł/mies. = 115,38 zł/godz. @ 40 h = 4 615,20 zł/tydz. = 239 990,40/rok

type UnitCase = { unit: string; typed: string };

const UNIT_CASES: Record<string, UnitCase[]> = {
  '6000,80': [
    { unit: 'hour', typed: '34,62' },
    { unit: 'week', typed: '1384,80' },
    { unit: 'month', typed: '6000,80' },
    { unit: 'year', typed: '72009,60' },
  ],
  '12001,60': [
    { unit: 'hour', typed: '69,24' },
    { unit: 'week', typed: '2769,60' },
    { unit: 'month', typed: '12001,60' },
    { unit: 'year', typed: '144019,20' },
  ],
  '19999,20': [
    { unit: 'hour', typed: '115,38' },
    { unit: 'week', typed: '4615,20' },
    { unit: 'month', typed: '19999,20' },
    { unit: 'year', typed: '239990,40' },
  ],
};

const unitSelect = (page: Page) => page.getByTestId('unit-select');
const hoursField = (page: Page) => page.locator('input#hours');

/** The whole answer/band/ladder surface, read as the browser renders it. */
async function screen(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 100_000));
  await page.waitForTimeout(400);
  const bar = page.getByTestId('sticky-net');
  const sticky = (await bar.count()) > 0 ? ((await bar.textContent()) ?? '') : '';
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  return {
    net: (await page.getByTestId('net-amount').textContent()) ?? '',
    from: (await page.locator('[data-testid="answer"] p').nth(2).textContent()) ?? '',
    band: (await page.getByTestId('band').locator('..').textContent()) ?? '',
    ladder: (await page.getByTestId('ladder').textContent()) ?? '',
    caption: (await page.locator('[data-testid="ladder"] caption').textContent()) ?? '',
    total: (await page.getByTestId('ladder-total').textContent()) ?? '',
    sticky,
  };
}

test('slice 4, criterion 1 — the unit lives inside the field, and costs the default nothing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  // §2's shape: a native select, four options in order, month selected, named
  // by a real <label for> rather than an aria-label.
  const select = unitSelect(page);
  await expect(select).toHaveAttribute('id', 'unit');
  expect(await select.evaluate((el) => el.tagName)).toBe('SELECT');
  expect(await select.locator('option').allTextContents()).toEqual([
    'zł / godz.',
    'zł / tydz.',
    'zł / mies.',
    'zł / rok',
  ]);
  expect(await select.locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value))).toEqual(
    ['hour', 'week', 'month', 'year'],
  );
  await expect(select).toHaveValue('month');
  await expect(page.getByLabel('Jednostka kwoty')).toHaveAttribute('id', 'unit');
  expect(
    await page.locator('label[for="unit"]').evaluate((el) => el.className),
    'the label must be visually hidden, not an aria-label',
  ).toContain('visually-hidden');
  // It replaces the uneditable suffix span, so it sits inside the input row.
  expect(
    await select.evaluate((el) => el.parentElement?.querySelector('input')?.id),
    'the select is not inside the amount field',
  ).toBe('gross');

  // Zero cost in the default state: the card is the height v0.3.0 shipped.
  const cardHeight = () => page.locator('section').filter({ has: page.locator('#gross') }).boundingBox();
  expect(Math.round((await cardHeight())!.height), 'the month card grew').toBe(282);
  for (const [unit, height] of [['week', 309], ['year', 309], ['hour', 361]] as const) {
    await select.selectOption(unit);
    await page.waitForTimeout(150);
    expect(Math.round((await cardHeight())!.height), `the ${unit} card`).toBe(height);
  }

  // No horizontal overflow anywhere: three widths, four units, both languages.
  for (const lang of ['Polski', 'Angielski'] as const) {
    await page.getByRole('radio', { name: lang }).click();
    for (const width of [320, 360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const unit of ['hour', 'week', 'month', 'year']) {
        await select.selectOption(unit);
        await page.waitForTimeout(120);
        const measured = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(measured.scroll, `${lang} ${width} ${unit} overflows`).toBeLessThanOrEqual(
          measured.client,
        );
      }
    }
  }
});

test('slice 4, criterion 3 — the conversion line prints the operation, never a rounded intermediate', async ({
  page,
}) => {
  await page.goto('/');
  const select = unitSelect(page);
  const conv = page.locator('#amount-conv');

  // Absent at month: the answer already is the conversion.
  await amountField(page).fill('6000');
  await expect(conv).toHaveCount(0);
  expect(await amountField(page).getAttribute('aria-describedby')).toBe(null);

  await select.selectOption('hour');
  await amountField(page).fill('35');
  await expect(conv).toBeVisible();
  await expect(conv).toHaveText('40 godz. tygodniowo × 52 tyg. ÷ 12 miesięcy.');
  // The operation, not its result. 173,33 h a month then 6 066,67 zł leaves a
  // reader who multiplies 12 grosz short — that is the defect, in one string.
  await expect(conv).not.toContainText('173');
  // And the figure the app actually computes from it, to the grosz.
  await expect(page.getByText(/miesięcznie, z 6\D?066,67 zł brutto/)).toBeVisible();

  for (const [unit, text] of [
    ['week', 'Tydzień × 52 ÷ 12 miesięcy — ta sama kwota co tydzień.'],
    ['year', 'Rok ÷ 12 miesięcy — ta sama kwota co miesiąc.'],
  ] as const) {
    await select.selectOption(unit);
    await expect(conv).toHaveText(text);
  }

  // §2: aria-describedby is a space-separated list, the conversion FIRST — it
  // is always true — then the error or the ambiguity note, still exclusive.
  await select.selectOption('week');
  await amountField(page).fill('1000');
  expect(await amountField(page).getAttribute('aria-describedby')).toBe('amount-conv');

  // §6: the range check moved onto the DERIVED monthly figure, and the message
  // names the maximum recomputed into the active unit. 35 000 zł/godz. must
  // never reach the engine as 60 666 667 zł/mies.
  await select.selectOption('hour');
  await amountField(page).fill('35000');
  await expect(amountField(page)).toHaveAttribute('aria-invalid', 'true');
  // pl-PL groups with a non-breaking space, and `unit.hour` ends in its own
  // full stop, so the sentence really does end in two. Matched as the browser
  // renders it rather than as it would be convenient to write.
  await expect(page.locator('#gross-error')).toHaveText(/^Wpisz kwotę od 0 do 5\D?769,23 zł \/ godz\.\.$/);
  expect(await amountField(page).getAttribute('aria-describedby')).toBe('amount-conv gross-error');
  await expect(page.getByTestId('net-amount')).toHaveCount(0);

  // The year unit accepts twelve times the monthly maximum, and one grosz more
  // than that is the same refusal.
  await select.selectOption('year');
  await amountField(page).fill('12000000');
  await expect(amountField(page)).not.toHaveAttribute('aria-invalid', 'true');
  await amountField(page).fill('12000001');
  await expect(page.locator('#gross-error')).toHaveText(
    /^Wpisz kwotę od 0 do 12\D?000\D?000,00 zł \/ rok\.$/,
  );
});

test('slice 4, criterion 4 — hours per week is asked, never invented', async ({ page }) => {
  await page.goto('/');
  const select = unitSelect(page);

  // §5's omit case: for a monthly figure, hours are not a component of the
  // value that exists — so the row is absent, not disabled and not struck out.
  for (const unit of ['month', 'week', 'year'] as const) {
    await select.selectOption(unit);
    await expect(hoursField(page), `the hours row appeared under ${unit}`).toHaveCount(0);
  }

  await select.selectOption('hour');
  await expect(page.getByText('Ile godzin tygodniowo?')).toBeVisible();
  await expect(hoursField(page)).toHaveValue('40');
  await expect(page.getByText('godz. / tydz.')).toBeVisible();

  await amountField(page).fill('35');
  await expect(page.getByText(/miesięcznie, z 6\D?066,67 zł brutto/)).toBeVisible();

  // One decimal, comma or dot. 37,5 is an ordinary Polish contract.
  // 35 × 37,5 × 52 ÷ 12 = 5 687,50 zł a month, exactly.
  await hoursField(page).fill('37,5');
  await expect(page.getByText(/miesięcznie, z 5\D?687,50 zł brutto/)).toBeVisible();
  await hoursField(page).fill('37.5');
  await expect(page.getByText(/miesięcznie, z 5\D?687,50 zł brutto/)).toBeVisible();

  // Empty, zero, a word and more than a week's worth are one case: the field is
  // invalid, the message is its own, and the result goes null rather than
  // falling back to a number nobody entered.
  for (const bad of ['', '0', 'abc', '169']) {
    await hoursField(page).fill(bad);
    await expect(hoursField(page), `"${bad}" was accepted`).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#hours-error')).toHaveText('Wpisz liczbę godzin od 1 do 168.');
    expect(await hoursField(page).getAttribute('aria-describedby')).toBe('hours-error');
    await expect(page.getByTestId('net-amount'), `"${bad}" still produced an answer`).toHaveCount(0);
    // The amount itself is not the thing that is wrong, and is not marked so.
    await expect(amountField(page)).not.toHaveAttribute('aria-invalid', 'true');
  }

  // Persisted under all four units and across a reload: it is the user's own
  // fact about their life, and losing it on a unit switch is a loss nobody
  // asked for. Round-tripped through the select rather than through storage.
  await hoursField(page).fill('37,5');
  await select.selectOption('year');
  await select.selectOption('hour');
  await expect(hoursField(page)).toHaveValue('37,5');
  await page.reload();
  await expect(hoursField(page)).toHaveValue('37,5');
});

test('slice 4, criteria 5 and 11 — the answer speaks monthly, byte-identical to v0.3.0', async ({
  page,
}) => {
  // The unit ends at the field's edge. The band, the ladder, every why-line,
  // the caption, the total row and the sticky mini-bar decompose a MONTHLY
  // gross, which is what they have always decomposed — so for the same monthly
  // gross they must be the strings the tagged release produced, in all four
  // units. `V030_SCREENS` was read out of a browser driven against v0.3.0
  // itself; comparing against this repository's own HEAD would prove nothing.
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  const select = unitSelect(page);

  for (const contract of ['Etat', 'Zlecenie', 'Dzieło'] as const) {
    await page.getByTestId('contract-bar').getByRole('radio', { name: contract }).click();

    // Criterion 11: the default screen, in the default unit, unchanged.
    for (const gross of ['6000', '12000', '20000']) {
      await select.selectOption('month');
      await amountField(page).fill(gross);
      await page.waitForTimeout(150);
      expect(await screen(page), `${contract}/${gross} against v0.3.0`).toEqual(
        V030_SCREENS[`${contract}/${gross}`],
      );
    }

    // Criterion 5: the same monthly gross reached through each of the four
    // units renders the same screen — with the echo line as the one addition.
    for (const [monthly, cases] of Object.entries(UNIT_CASES)) {
      const reference = V030_SCREENS[`${contract}/${monthly}`];
      for (const { unit, typed } of cases) {
        await select.selectOption(unit);
        await amountField(page).fill(typed);
        await page.waitForTimeout(150);
        expect(await screen(page), `${contract} ${monthly} via ${unit}`).toEqual(reference);
      }

      // The echo renders only when the unit is not a month, and it carries the
      // user's own unit — 6 000,80 zł/mies. net, spoken per hour.
      await select.selectOption('month');
      await expect(page.getByTestId('answer-perunit')).toHaveCount(0);
      await select.selectOption('hour');
      await expect(page.getByTestId('answer-perunit')).toContainText('≈');
      await expect(page.getByTestId('answer-perunit')).toContainText('za godzinę');
    }
  }
});

test('slice 4, criterion 8 — the quick-fill sets everything it asserts', async ({ page }) => {
  // P2-L, driven by the gesture that produced it: a real click at 390, from
  // netto mode and a unit that is not a month. The chip says "brutto", so it
  // must leave a screen where brutto is what the field means.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await direction(page, 'n2g').click();
  await unitSelect(page).selectOption('year');
  await amountField(page).fill('90000');

  const quick = page.getByRole('button', { name: /Płaca minimalna/ });
  await expect(quick).toHaveText(/^Płaca minimalna 2026 — 4\D?806 zł brutto$/);
  const box = await target(quick);
  expect(box.height, 'the chip is under the 44 px floor').toBeGreaterThanOrEqual(44);
  await page.mouse.click(box.x + box.width / 2, box.y + 4);

  await expect(amountField(page)).toHaveValue('4806');
  await expect(unitSelect(page)).toHaveValue('month');
  await expect(direction(page, 'g2n')).toHaveAttribute('aria-checked', 'true');
  // Each of the three is something the cited figure genuinely asserts, so the
  // screen after the click is the one the label describes.
  await expect(page.getByTestId('net-amount')).toHaveText(/3\D?605,85/);
  await expect(page.getByText(GROSS_LABEL_PL, { exact: true })).toBeVisible();
});

test('slice 4, criterion 10 — the accessibility floor holds on both new controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const select = unitSelect(page);

  // The defect the designer found by rendering: `select` is absent from
  // base.css's :focus-visible list, so the control would ship the browser's
  // blue ring. Measured in ink, not asserted from the stylesheet.
  await select.focus();
  const ring = await select.evaluate((el) => {
    const style = getComputedStyle(el);
    return { color: style.outlineColor, width: style.outlineWidth, style: style.outlineStyle };
  });
  expect(ring.width, 'the focus ring is not 3 px').toBe('3px');
  expect(ring.color, 'the focus ring is not the ink colour').toBe('rgb(43, 33, 28)');
  expect(ring.style).toBe('solid');

  // 44 px targets on both new controls.
  const selectBox = await target(select);
  expect(selectBox.height, 'the select is under the 44 px floor').toBeGreaterThanOrEqual(44);
  expect(selectBox.width).toBeGreaterThanOrEqual(44);
  await select.selectOption('hour');
  const hoursBox = await target(hoursField(page));
  expect(hoursBox.height, 'the hours field is under the 44 px floor').toBeGreaterThanOrEqual(44);

  // A unit change is an ANSWER: it announces at once, un-debounced, one
  // utterance. Typed hours are a keystroke and debounce with the amount.
  await select.selectOption('month');
  await amountField(page).fill('6000');
  await expect(page.getByTestId('live')).toHaveText(/4\D?420,43/);
  await installLiveProbe(page, '[data-testid="live"]');

  await select.selectOption('year');
  announcedAtOnce(await utterances(page), 'a unit change');
  await select.selectOption('hour');
  announcedAtOnce(await utterances(page), 'a unit change onto hours');

  // `Answer`'s announce key gains `unit` and must NOT gain `hoursPerWeek`: one
  // is an answer, the other is a typed field, and a key that names both reads
  // every keystroke of the hours aloud.
  await amountField(page).fill('35');
  await expect(page.getByTestId('live')).toHaveText(/6\D?066,67/);
  await installLiveProbe(page, '[data-testid="live"]');
  await hoursField(page).fill('');
  await hoursField(page).pressSequentially('20', { delay: 20 });
  const typed = await utterances(page);
  expect(typed, `typing hours said ${typed.length} things, not one`).toHaveLength(1);
  expect(
    latency(typed),
    `the hours field announced after ${latency(typed)} ms — a typed field must debounce`,
  ).toBeGreaterThan(400);
});
