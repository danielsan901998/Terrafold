import { test, expect } from '@playwright/test';

test.describe('Game Progression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mainContainer');
  });

  test('should progress through all unlocks until all containers are visible', async ({ page }) => {
    // Set viewport to ensure masonry layout has enough space for multiple columns
    await page.setViewportSize({ width: 1280, height: 800 });

    const initialContainers = [
      '#iceContainer', '#indoorWaterContainer', '#outdoorWaterContainer',
      '#cloudsContainer', '#landContainer', '#treesContainer',
      '#foodContainer', '#populationContainer', '#computerContainer'
    ];

    const lateGameContainers = [
      '#robotsContainer', '#energyContainer', '#spaceStationContainer',
      '#tractorBeamContainer', '#spaceDockContainer', '#hangarContainer'
    ];

    const checkVisibility = async (unlockedCount: number) => {
      // All initial containers should always be visible
      for (const selector of initialContainers) {
        await expect(page.locator(selector)).toBeVisible();
      }
      // Late game containers are visible only if their index < unlockedCount
      for (let i = 0; i < lateGameContainers.length; i++) {
        const selector = lateGameContainers[i]!;
        if (i < unlockedCount) {
          await expect(page.locator(selector)).toBeVisible();
        } else {
          await expect(page.locator(selector)).toBeHidden();
        }
      }
    };

    // Start: Initial containers should be visible, late game hidden
    await checkVisibility(0);

    // 1. Unlock Robots (via Computer)
    await page.evaluate(() => {
      (window as any).game.science = 1000;
      (window as any).game.computer.unlockComputer();
    });
    await checkVisibility(1);

    // 2. Unlock Energy (via Robots)
    await page.evaluate(() => {
      (window as any).game.cash = 3000;
      (window as any).game.robots.unlockRobots();
    });
    await checkVisibility(2);
    await expect(page.locator('#woodContainer')).toBeVisible();
    await expect(page.locator('#metalContainer')).toBeVisible();

    // 3. Unlock Space Station (via Energy)
    await page.evaluate(() => {
      (window as any).game.metal = 500;
      (window as any).game.energy.unlockEnergy();
    });
    await checkVisibility(3);

    // 4. Unlock Tractor Beam (via Space Station)
    await page.evaluate(() => {
      (window as any).game.metal = 2000;
      (window as any).game.wood = 20000;
      (window as any).game.spaceStation.unlockSpaceStation();
    });
    await checkVisibility(4);

    // 5. Unlock Space Dock & Hangar (via Tractor Beam)
    await page.evaluate(() => {
      (window as any).game.science = 5e5;
      (window as any).game.oxygen = 5e6;
      (window as any).game.tractorBeam.unlockTractorBeam();
    });
    // Space Dock and Hangar are unlocked together
    await checkVisibility(6); 
    await expect(page.locator('#spaceContainer')).toBeVisible();

    // Final check: Verify they are all in columns
    const allMainContainers = [...initialContainers, ...lateGameContainers];
    for (const selector of allMainContainers) {
      const container = page.locator(selector);
      const parentClass = await container.evaluate(el => el.parentElement?.className);
      expect(parentClass).toBe('column');
    }

    // Verify that at least one column has multiple children (masonry working)
    const columnCounts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.column')).map(col => col.children.length);
    });
    expect(columnCounts.some(count => count > 1)).toBe(true);
  });
});
