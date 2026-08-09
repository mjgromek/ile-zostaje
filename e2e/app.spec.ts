import { expect, test, type Page } from '@playwright/test';

// Acceptance criteria 1, 3, 5, 6 and 7, driven in a real browser against the
// running app. Criterion 8 asks for exactly this: the artifact, not the diff.

const GROSS_LABEL_PL = 'Kwota brutto miesięcznie';
const SWITCH_LABEL_PL = 'Mam mniej niż 26 lat';

/** pl-PL groups thousands with a non-breaking space. Compare on digits only. */
function digits(text: string | null): string {
  return (text ?? '').replace(/[^\d,.-]/g, '');
}

async function enterGross(page: Page, value: string) {
  const input = page.getByLabel(GROSS_LABEL_PL);
  await input.fill(value);
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

test('criterion 3 — the under-26 switch changes the net and zeroes the tax line', async ({
  page,
}) => {
  await page.goto('/');
  await enterGross(page, '6000');

  const net = page.getByTestId('net-amount');
  const pit = page.getByTestId('line-pit-amount');

  await expect(net).toHaveText(/4\D?420,43/);
  expect(digits(await pit.textContent())).toContain('291,00');

  await page.getByRole('switch', { name: SWITCH_LABEL_PL }).check();

  await expect(net).toHaveText(/4\D?711,43/);
  await expect(pit).toContainText('0 zł');
  await expect(page.getByText('Ulga dla młodych — 0 zł')).toBeVisible();

  await page.getByRole('switch', { name: SWITCH_LABEL_PL }).uncheck();
  await expect(net).toHaveText(/4\D?420,43/);
});

test('criterion 5 — the language switch renders the whole screen in both languages', async ({
  page,
}) => {
  await page.goto('/');
  await enterGross(page, '6000');

  const body = page.locator('body');
  await expect(body).toContainText('Wpisz, ile masz brutto.');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');

  await page.getByRole('radio', { name: 'Angielski' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(body).toContainText('Enter your gross pay.');
  await expect(body).not.toContainText('Wpisz, ile masz brutto.');
  await expect(body).toContainText('Pension contribution');
  // Two legal contract types keep their Polish names in the EN build. This is
  // the one deliberate exception, glossed in the helper text.
  await expect(body).toContainText('Zlecenie');
  await expect(body).toContainText('Dzieło');

  // A missing key renders as ⟦key⟧, so its absence is the assertion.
  await expect(body).not.toContainText('⟦');

  await page.getByRole('radio', { name: 'Polish' }).click();
  await expect(body).toContainText('Wpisz, ile masz brutto.');
  await expect(body).not.toContainText('⟦');
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
  await page.getByRole('switch', { name: SWITCH_LABEL_PL }).check();
  await expect(page.getByTestId('net-amount')).toHaveText(/3\D?773,85/);

  await page.reload();

  await expect(page.getByLabel(GROSS_LABEL_PL)).toHaveValue('4806');
  await expect(page.getByRole('switch', { name: SWITCH_LABEL_PL })).toBeChecked();
  await expect(page.getByTestId('net-amount')).toHaveText(/3\D?773,85/);

  expect(foreign).toEqual([]);
});
