// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const CI = !!process.env.CI;
// Lokalt kan en befintlig Chromium användas: PW_CHROMIUM=/sökväg/till/chrome npx playwright test --project="Platta (Chromium)"
const egenChromium = process.env.PW_CHROMIUM ? { launchOptions: { executablePath: process.env.PW_CHROMIUM } } : {};

// iPad Air (3:e gen) i liggande läge
const IPAD_AIR = { width: 1112, height: 834 };

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'rapport/playwright', open: 'never' }],
    ['./tests/rapport-reporter.js', { outputDir: 'rapport' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173/',
    locale: 'sv-SE',
    timezoneId: 'Europe/Stockholm',
    geolocation: { latitude: 59.3467, longitude: 18.0989 },
    permissions: ['geolocation'],
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'iPad (WebKit)', use: { ...devices['iPad (gen 7) landscape'], viewport: IPAD_AIR } },
    { name: 'Platta (Chromium)', use: { ...devices['Galaxy Tab S4 landscape'], viewport: IPAD_AIR, ...egenChromium } }
  ],
  webServer: {
    command: 'npx http-server . -p 4173 -a 127.0.0.1 -c-1 --silent',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !CI,
    timeout: 30000
  }
});
