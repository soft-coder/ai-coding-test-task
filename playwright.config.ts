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
    baseURL: 'http://127.0.0.1:4200',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    trace: 'on-first-retry',
  },
  expect: {
    // A little extra headroom for screenshot stabilization.
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
    // Bind ng serve to IPv4 so Playwright's readiness probe matches the host it
    // polls — `localhost` resolves to IPv6 (::1) on Windows and the probe hangs.
    command: 'npm start -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
