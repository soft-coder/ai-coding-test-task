import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for e2e + visual regression.
 *
 * Fixed 1920×1080 viewport matches the Figma frame so screenshots compare
 * like-for-like; chromium only keeps the visual diffs deterministic. Committed
 * baselines under `e2e/__screenshots__` are the source of truth; a small
 * `maxDiffPixelRatio` absorbs anti-aliasing noise. The dev server is started
 * automatically for the run.
 */
export default defineConfig({
  testDir: './e2e',
  snapshotDir: './e2e/__screenshots__',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    trace: 'on-first-retry',
  },
  expect: {
    // Screenshot stabilization needs more headroom on the slow shared-folder env.
    timeout: 20_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
  webServer: {
    // Serve the built app statically (see e2e/serve-dist.mjs for why not `ng serve`).
    // `npm run e2e` runs `ng build` first, so the static server starts instantly.
    command: 'node e2e/serve-dist.mjs',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
