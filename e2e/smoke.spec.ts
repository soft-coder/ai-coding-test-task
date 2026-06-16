import { test, expect } from '@playwright/test';

/**
 * Scaffold smoke + a first visual baseline to prove the e2e/visual pipeline.
 * Per-screen baselines land in their feature PRs.
 */

test('boots and redirects to /categories', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/categories$/);
  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();
});

test('categories placeholder matches baseline', async ({ page }) => {
  await page.goto('/categories', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('categories-placeholder.png');
});
