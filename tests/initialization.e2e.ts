import { test, expect } from '@playwright/test';

test.describe('Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mainContainer');
  });

  test('should initialize the game correctly without errors', async ({ page }) => {
    const errors: any[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for game to initialize and verify core objects
    const isGameInitialized = await page.evaluate(() => {
      return (window as any).game !== undefined;
    });
    expect(isGameInitialized).toBe(true);

    // Verify key UI elements and resource containers
    const expectedElements = [
      '#totalWater',
      '#cash',
      '#iceContainer',
      '#indoorWaterContainer',
      '#cloudsContainer',
      '#landContainer',
      '#treesContainer',
      '#populationContainer'
    ];

    for (const selector of expectedElements) {
      await expect(page.locator(selector)).toBeVisible();
    }

    // Verify late game containers and contents are hidden initially
    const hiddenElements = [
      '#robotsContainer',
      '#energyContainer',
      '#spaceStationContainer',
      '#tractorBeamContainer',
      '#spaceDockContainer',
      '#hangarContainer',
      '#spaceContainer',
      '#unlockedComputer',
      '#unlockedEnergy',
      '#unlockedSpaceStation',
      '#unlockedTractorBeam',
      '#unlockedRobots',
      '#lightningContainer',
      '#lightningTooltip',
      '#woodContainer',
      '#metalContainer'
    ];

    for (const selector of hiddenElements) {
      await expect(page.locator(selector)).toBeHidden();
    }

    expect(errors, `Uncaught exceptions: ${errors.map(e => e.stack).join('\n')}`).toHaveLength(0);
    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toHaveLength(0);
  });

  test('should tick automatically via worker', async ({ page }) => {
    // Set buyable ice to 0 and record initial state
    await page.evaluate(() => {
      (window as any).game.ice.buyable = 0;
      (window as any).game.ice.gain = 10;
    });

    // Wait for some time
    // The default tick rate is 10 ticks per second (100ms per tick).
    await page.waitForTimeout(200);

    // Check if buyable ice has increased
    const buyableIce = await page.evaluate(() => (window as any).game.ice.buyable);
    
    expect(buyableIce, 'Game should tick automatically and increase buyable ice').toBeGreaterThan(0);
  });
});
