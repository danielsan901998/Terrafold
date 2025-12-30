import { test, expect } from '@playwright/test';

test.describe('Terrafold E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mainContainer');
  });

  test.describe('Initialization', () => {
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
        '#outdoorWaterContainer',
        '#cloudsContainer',
        '#landContainer',
        '#treesContainer',
        '#foodContainer',
        '#populationContainer'
      ];

      for (const selector of expectedElements) {
        await expect(page.locator(selector)).toBeVisible();
      }

      expect(errors, `Uncaught exceptions: ${errors.map(e => e.stack).join('\n')}`).toHaveLength(0);
      expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toHaveLength(0);
    });
  });

  test.describe('Gameplay Mechanics', () => {
    test('should handle core gameplay mechanics', async ({ page }) => {
      // 1. Ice buying and begging
      await page.evaluate(() => {
          (window as any).game.cash = 100;
          (window as any).game.ice.buyable = 100;
          (window as any).game.ice.ice = 0;
          (window as any).view.update();
      });

      const initialCash = await page.evaluate(() => (window as any).game.cash);
      await page.evaluate(() => {
          const btn = document.getElementById('btnBuyIce');
          if (btn) btn.click();
      });
      expect(await page.evaluate(() => (window as any).game.cash), 'Cash should have decreased after buying ice').toBeLessThan(initialCash);
      expect(await page.evaluate(() => (window as any).game.ice.ice), 'Ice should have increased after click').toBeGreaterThan(0);

      const optionsMenu = page.locator('.infoText').nth(2);
      await optionsMenu.hover();
      await expect(page.locator('#btnBeg')).toBeVisible({ timeout: 5000 });
      const cashBeforeBeg = await page.evaluate(() => (window as any).game.cash);
      await page.evaluate(() => {
          const btn = document.getElementById('btnBeg');
          if (btn) btn.click();
      });
      expect(await page.evaluate(() => (window as any).game.cash)).toBeCloseTo(cashBeforeBeg + 0.1, 5);

      // 2. Resource conversion (Ice -> Water -> Cash)
      await page.evaluate(() => {
          (window as any).game.ice.ice = 1000;
          (window as any).game.water.indoor = 0;
          (window as any).game.cash = 0;
          (window as any).view.update();
      });

      await page.evaluate(() => {
          for(let i=0; i<10; i++) (window as any).game.tick();
          (window as any).view.update();
      });

      const indoorWater = await page.evaluate(() => (window as any).game.water.indoor);
      expect(indoorWater, 'Ice should melt into indoor water').toBeGreaterThan(0);
      const indoorWaterText = await page.textContent('#indoorWater');
      expect(parseFloat(indoorWaterText!.replace(/,/g, ''))).toBeGreaterThan(0);

      const cashAfterMelt = await page.evaluate(() => (window as any).game.cash);
      expect(cashAfterMelt, 'Indoor water should be sold for cash').toBeGreaterThan(0);
      const cashText = await page.textContent('#cash');
      expect(parseFloat(cashText!.replace(/,/g, ''))).toBeGreaterThan(0);

      // 3. Farms and Population
      await page.evaluate(() => {
          (window as any).game.land.soil = 100;
          (window as any).game.farms.farms = 0;
          (window as any).game.farms.food = 100;
          (window as any).game.population.people = 0;
          (window as any).view.update();
      });
      await page.evaluate(() => {
          const btn = document.getElementById('btnBuyFarms');
          if (btn) btn.click();
      });
      expect(await page.evaluate(() => (window as any).game.farms.farms)).toBeGreaterThan(0);
      expect(await page.evaluate(() => (window as any).game.land.soil)).toBeLessThan(100);
      
      await page.evaluate(() => {
          for(let i=0; i<100; i++) (window as any).game.tick();
          (window as any).view.update();
      });
      expect(await page.evaluate(() => (window as any).game.population.people)).toBeGreaterThan(0);
      const popText = await page.textContent('#population');
      expect(parseFloat(popText!.replace(/,/g, ''))).toBeGreaterThan(0);

      // 4. Computer Unlocking
      await page.evaluate(() => {
          (window as any).game.science = 1000;
          (window as any).view.update();
      });
      await expect(page.locator('#unlockComputer')).toBeVisible();
      await page.click('#unlockComputer', { force: true });
      await expect(page.locator('#unlockedComputer')).toBeVisible();
      expect(await page.evaluate(() => (window as any).game.computer.unlocked)).toBe(1);

      // 5. Scientific notation in inputs
      await page.evaluate(() => {
          (window as any).game.land.soil = 1e15;
          (window as any).game.farms.farms = 0;
          (window as any).view.update();
      });
      await page.locator('#buyFarmAmount').fill('1e2');
      await page.evaluate(() => {
          const btn = document.getElementById('btnBuyFarms');
          if (btn) btn.click();
      });
      expect(await page.evaluate(() => (window as any).game.farms.farms)).toBe(100);
    });
  });

  test.describe('Import/Export', () => {
    test('should not duplicate computer or robot rows after import', async ({ page }) => {
      const saveContent = JSON.stringify({
          "cash": 1000,
          "science": 1000,
          "computer": {
              "unlocked": 1,
              "threads": 10,
              "processes": Array(9).fill({threads: 0, currentTicks: 0, ticksNeeded: 100})
          },
          "robots": {
              "unlocked": 1,
              "jobs": Array(6).fill({workers: 0})
          }
      });

      const initialComputerRows = await page.locator('.computerRow').count();
      const initialRobotRows = await page.locator('.robotRow').count();

      await page.evaluate((content) => {
          const el = document.getElementById('exportImportSave') as HTMLTextAreaElement;
          if (el) el.value = content;
          const btn = document.getElementById('btnImport');
          if (btn) btn.click();
      }, saveContent);

      const computerRowsAfter = await page.locator('.computerRow').count();
      const robotRowsAfter = await page.locator('.robotRow').count();

      expect(computerRowsAfter, 'Computer rows should not be duplicated').toBe(9);
      expect(robotRowsAfter, 'Robot rows should not be duplicated').toBe(6);
    });
  });
});
