import { defineConfig, devices } from '@playwright/test';
import { playConfig } from '@shared/playwright-config';

export default defineConfig({
  timeout: 900_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  preserveOutput: 'always',
  
  use: {
    actionTimeout: playConfig.timeouts.action,
    trace: playConfig.trace,
    screenshot: playConfig.screenshot,
    launchOptions: playConfig.launchOptions,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: playConfig.viewport
      },
    },
  ],
});