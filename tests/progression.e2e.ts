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
      '#iceContainer',
      '#cloudsContainer', '#landContainer', '#treesContainer',
      '#populationContainer', '#computerContainer'
    ];

    const lateGameContainers = [
      '#robotsContainer', '#energyContainer', '#spaceStationContainer',
      '#tractorBeamContainer', '#spaceDockContainer', '#hangarContainer',
      '#dysonSwarmContainer'
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

    const checkComputerRows = async (expected: number) => {
      const count = await page.locator('.computerRow:visible').count();
      expect(count).toBe(expected);
    };

    const checkRobotRows = async (expected: number) => {
      const count = await page.locator('.robotRow:visible').count();
      expect(count).toBe(expected);
    };

    // Start: Initial containers should be visible, late game hidden
    await checkVisibility(0);
    await checkComputerRows(0);
    await checkRobotRows(0);

    // 1. Unlock Computer (which shows Robots container)
    await page.evaluate(() => {
      (window as any).game.science = 1000;
    });
    await page.click('#unlockComputer');
    await checkVisibility(1);
    await checkComputerRows(6);
    await checkRobotRows(0);

    // 2. Unlock Robots (via Robots container)
    await page.evaluate(() => {
      (window as any).game.cash = 3000;
    });
    await page.click('#unlockRobots');
    await checkVisibility(2);
    await expect(page.locator('#woodContainer')).toBeVisible();
    await expect(page.locator('#metalContainer')).toBeVisible();
    await checkComputerRows(9);
    await checkRobotRows(5);

    // 3. Unlock Energy (via Power Plant container)
    await page.evaluate(() => {
      (window as any).game.metal = 500;
    });
    await page.click('#unlockEnergy');
    await checkVisibility(3);
    await checkComputerRows(9);
    await checkRobotRows(6);

    // 4. Unlock Space Station
    await page.evaluate(() => {
      (window as any).game.metal = 2000;
      (window as any).game.wood = 20000;
    });
    await page.click('#unlockSpaceStation');
    await checkVisibility(4);
    await checkComputerRows(9);
    await checkRobotRows(6);

    // 5. Unlock Tractor Beam
    await page.evaluate(() => {
      (window as any).game.science = 5e5;
      (window as any).game.oxygen = 5e6;
    });
    await page.click('#unlockTractorBeam');
    // Space Dock, Hangar and Dyson Swarm are unlocked together
    await checkVisibility(7); 
    await expect(page.locator('#spaceContainer')).toBeVisible();
    await checkComputerRows(10);
    await checkRobotRows(6);

    // 6. Unlock Dyson Swarm
    await page.evaluate(() => {
      (window as any).game.science = 1e12;
      (window as any).game.metal = 1e7;
    });
    await page.click('#unlockDysonSwarm');
    await expect(page.locator('#unlockedDysonSwarm')).toBeVisible();

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
