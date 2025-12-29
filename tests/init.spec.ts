import { test, expect } from '@playwright/test';

test.describe('Terrafold Initialization', () => {
  test('should load without console errors or uncaught exceptions', async ({ page }) => {
    const errors: any[] = [];
    const consoleErrors: string[] = [];

    // Catch uncaught exceptions
    page.on('pageerror', (error) => {
      errors.push(error);
    });

    // Catch console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');

    // Wait for the game to initialize (it calls load() at the end of main.ts)
    await page.waitForSelector('#mainContainer');

    // Verify key UI elements are present
    await expect(page.locator('#totalWater')).toBeVisible();
    await expect(page.locator('#cash')).toBeVisible();
    
    // Check if game object is attached to window (as done in main.ts)
    const isGameInitialized = await page.evaluate(() => {
      return (window as any).game !== undefined;
    });
    expect(isGameInitialized).toBe(true);

    // Assert no errors occurred during load
    expect(errors, `Uncaught exceptions: ${errors.map(e => e.stack).join('\n')}`).toHaveLength(0);
    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toHaveLength(0);
  });

  test('should have essential containers visible', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const containers = [
      '#iceContainer',
      '#indoorWaterContainer',
      '#outdoorWaterContainer',
      '#cloudsContainer',
      '#landContainer',
      '#treesContainer',
      '#foodContainer',
      '#populationContainer'
    ];

    for (const selector of containers) {
      await expect(page.locator(selector)).toBeVisible();
    }
  });
});
