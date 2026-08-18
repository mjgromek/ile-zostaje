import { expect, test, type Page } from '@playwright/test';

// Slice 1's criteria 1, 3, 5, 6 and 7 and slice 2's criteria 1, 2, 3 and 4,
// driven in a real browser against the running app. The checker drives the
// artifact, not the diff.

const GROSS_LABEL_PL = 'Kwota brutto miesięcznie';
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
    page.getByTestId('sources').getByRole('link', { name: /Umowy zlecenia i umowy o dzieło/ }),
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
  expect(pl).toHaveLength(20);
  // Four different numbers under one label is the defect: a reader opening the
  // disclosure to find where 250 zł came from was told "Zaliczka na PIT".
  expect(new Set(pl.map((entry) => entry.label)).size).toBe(20);
  // pl-PL groups with a non-breaking space, so the value is matched on digits.
  const labelFor = (list: { value: string; label: string }[], amount: string) =>
    list.find((entry) => digits(entry.value) === amount)?.label;

  expect(labelFor(pl, '250,00')).toMatch(/Koszty uzyskania przychodu/);
  expect(labelFor(pl, '85528,00')).toMatch(/ulgi dla młodych/);

  await page.getByRole('radio', { name: 'Angielski' }).click();

  const en = await provenance(page);
  expect(new Set(en.map((entry) => entry.label)).size).toBe(20);
  expect(labelFor(en, '250.00')).toMatch(/Deductible costs/);
  // Criterion 5 holds for the keys this fix adds, in both tables.
  await expect(page.getByTestId('sources')).not.toContainText('⟦');
});
