import { test, expect } from '@playwright/test';

/** Categories list: visual baseline + client-side search/sort, against a mocked list. */

const CATEGORIES = {
  canAdd: true,
  items: [
    { id: 1, name: 'Controllers', canEdit: true, canDelete: true },
    { id: 2, name: 'Notifications', canEdit: true, canDelete: true },
    { id: 3, name: 'Sensors', canEdit: false, canDelete: false },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth.token', 'e2e-token');
    localStorage.setItem('auth.refreshToken', 'e2e-refresh');
  });
  await page.route('**/front/categories', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CATEGORIES),
    }),
  );
  await page.goto('/categories');
  await page.evaluate(() => document.fonts.ready);
});

test('categories list matches baseline', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();
  await expect(page.getByText('Controllers')).toBeVisible();
  await expect(page).toHaveScreenshot('categories-list.png');
});

test('search filters the list client-side', async ({ page }) => {
  await page.getByPlaceholder('Search').fill('sens');
  await expect(page.getByText('Sensors')).toBeVisible();
  await expect(page.getByText('Controllers')).toHaveCount(0);
});

test('clicking the Name header toggles sort direction', async ({ page }) => {
  await expect(page.locator('.table__row').first()).toContainText('Controllers');
  await page.getByRole('button', { name: 'Name' }).click();
  await expect(page.locator('.table__row').first()).toContainText('Sensors');
});
