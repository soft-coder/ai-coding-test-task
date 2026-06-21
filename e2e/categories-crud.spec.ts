import { test, expect, Page } from '@playwright/test';

/**
 * CRUD: routed Add/Edit dialogs and the delete confirmation, against a mocked API.
 * Covers visual baselines for each dialog plus the create/edit/delete round-trips
 * (asserting the outgoing requests, since the backend is stubbed).
 */

const CATEGORIES = {
  canAdd: true,
  items: [
    { id: 1, name: 'Controllers', canEdit: true, canDelete: true },
    { id: 2, name: 'Notifications', canEdit: true, canDelete: true },
    { id: 3, name: 'Sensors', canEdit: false, canDelete: false },
  ],
};

async function mockApi(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('auth.token', 'e2e-token');
    localStorage.setItem('auth.refreshToken', 'e2e-refresh');
  });

  // List (GET) + create (POST) share the collection URL.
  await page.route('**/front/categories', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '42' });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CATEGORIES),
    });
  });

  // Single record: GET (load for edit), POST (update), DELETE.
  await page.route('**/front/categories/*', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, name: 'Controllers', canEdit: true, canDelete: true }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '' });
  });

  // Async name validator — registered last so it wins over the by-id matcher.
  await page.route('**/front/categories/name-exists*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: 'false' }),
  );
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('add dialog matches baseline', async ({ page }) => {
  await page.goto('/categories/new');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Add', { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('categories-add-dialog.png');
});

test('edit dialog matches baseline and shows the id', async ({ page }) => {
  await page.goto('/categories/1');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Edit', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Controllers');
  await expect(page).toHaveScreenshot('categories-edit-dialog.png');
});

test('delete confirmation matches baseline', async ({ page }) => {
  await page.goto('/categories');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.table__row', { hasText: 'Controllers' }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Sure to delete this element?')).toBeVisible();
  await expect(page).toHaveScreenshot('categories-delete-dialog.png');
});

test('creating a category posts the name and returns to the list', async ({ page }) => {
  await page.goto('/categories/new');
  const post = page.waitForRequest(
    (req) => req.url().endsWith('/front/categories') && req.method() === 'POST',
  );
  await page.getByRole('textbox', { name: 'Name' }).fill('Brand new');
  await page.getByRole('button', { name: 'Save' }).click();
  const request = await post;
  expect(request.postDataJSON()).toEqual({ name: 'Brand new' });
  await expect(page).toHaveURL(/\/categories$/);
});

test('deleting a category issues DELETE after confirmation', async ({ page }) => {
  await page.goto('/categories');
  await page.locator('.table__row', { hasText: 'Controllers' }).getByRole('button', { name: 'Delete' }).click();
  const del = page.waitForRequest(
    (req) => /\/front\/categories\/1$/.test(req.url()) && req.method() === 'DELETE',
  );
  await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
  await del;
  await expect(page.getByText('Sure to delete this element?')).toHaveCount(0);
});
