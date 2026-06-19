import { test, expect } from '@playwright/test';

/** Visual baselines for the three Figma login states: default, validation, server error. */

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => document.fonts.ready);
});

test('login default matches baseline', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Logon to Zidium' })).toBeVisible();
  await expect(page).toHaveScreenshot('login-default.png');
});

test('login validation state matches baseline', async ({ page }) => {
  await page.getByRole('button', { name: 'Logon' }).click();
  await expect(page.getByText('Field is required').first()).toBeVisible();
  await expect(page).toHaveScreenshot('login-validation.png');
});

test('login server-error state matches baseline', async ({ page }) => {
  // Backend returns RFC9110 ProblemDetails; the message comes from `detail`.
  await page.route('**/front/logon', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ title: 'Bad Request', status: 400, detail: 'User is blocked' }),
    }),
  );

  await page.getByLabel('Login').fill('LoginExample123');
  await page.getByLabel('Password').fill('supersecret');
  await page.getByRole('button', { name: 'Logon' }).click();

  await expect(page.getByText('User is blocked')).toBeVisible();
  await expect(page).toHaveScreenshot('login-server-error.png');
});
