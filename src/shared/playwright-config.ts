export const playConfig = {
  // Launch options for the browser
  launchOptions: {
    slowMo: 300,
    headless: true,
    args: [
      '--disable-gpu',                 
      '--js-flags=--max-old-space-size=4096',
    ]
  },
  
  // Timeouts
  timeouts: {
    action: 30_000,
    navigation: 30_000,
  },
  
  // Screenshot and trace settings
  screenshot: 'only-on-failure' as const,
  trace: 'retain-on-failure' as const,
  
  // Browser type
  browserType: 'chromium' as const,
  
  // Viewport (from Desktop Chrome device)
  viewport: {
    width: 1920,
    height: 1080,
  },
  
  // User agent and other context options you might need
  // Add any other settings your scraper might need
};