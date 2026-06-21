import { test, expect } from '@playwright/test';

/** Boot + auth-gating smoke. Per-screen visual baselines live in their feature specs. */

test('unauthenticated boot redirects to /login', async ({ page }) => {
  await page.goto('/');
  // Guard appends ?returnUrl=… so match the path, not end-of-string.
  await expect(page).toHaveURL(/\/login(\?|$)/);
  await expect(page.getByRole('heading', { name: 'Logon to Zidium' })).toBeVisible();
});

test('a stored token lets the user reach /categories', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth.token', 'e2e-token');
    localStorage.setItem('auth.refreshToken', 'e2e-refresh');
  });
  await page.goto('/categories');
  await expect(page).toHaveURL(/\/categories$/);
  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();
});
