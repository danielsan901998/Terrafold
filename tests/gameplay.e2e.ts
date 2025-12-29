import { test, expect } from '@playwright/test';

test.describe('Terrafold Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mainContainer');
    // Ensure we start with a clean state if possible, or just wait for init
    await page.evaluate(() => {
        if ((window as any).game) {
            (window as any).game.cash = 100;
            (window as any).game.ice.ice = 0;
            (window as any).game.ice.buyable = 100;
        }
    });
  });

  test('should be able to buy ice', async ({ page }) => {
    // Reset state
    await page.evaluate(() => {
        (window as any).game.cash = 100;
        (window as any).game.ice.buyable = 100;
        (window as any).game.ice.ice = 0;
        (window as any).view.update();
    });

    const initialCash = await page.evaluate(() => (window as any).game.cash);
    
    // Attempt to click the button via JS click to be sure it triggers
    await page.evaluate(() => {
        const btn = document.getElementById('btnBuyIce');
        if (btn) btn.click();
    });

    const newCash = await page.evaluate(() => (window as any).game.cash);
    const newIce = await page.evaluate(() => (window as any).game.ice.ice);

    expect(newCash, 'Cash should have decreased after click').toBeLessThan(initialCash);
    expect(newIce, 'Ice should have increased after click').toBeGreaterThan(0);
  });

  test('should be able to beg for money', async ({ page }) => {
    // S is nth(0), ? is nth(1), O is nth(2)
    const optionsMenu = page.locator('.infoText').nth(2);
    await optionsMenu.hover();
    
    // Wait for the button to be visible
    await expect(page.locator('#btnBeg')).toBeVisible({ timeout: 5000 });
    
    const initialCash = await page.evaluate(() => (window as any).game.cash);
    
    // Use evaluate click here too if Playwright's click is failing
    await page.evaluate(() => {
        const btn = document.getElementById('btnBeg');
        if (btn) btn.click();
    });
    
    const newCash = await page.evaluate(() => (window as any).game.cash);
    expect(newCash).toBeCloseTo(initialCash + 0.1, 5);
  });

  test('should unlock computer when having enough science', async ({ page }) => {
    // Manually set science
    await page.evaluate(() => {
        (window as any).game.science = 1000;
    });

    // Check if button is visible
    await expect(page.locator('#unlockComputer')).toBeVisible();
    
    await page.click('#unlockComputer', { force: true });

    // Verify unlocked state
    await expect(page.locator('#unlockedComputer')).toBeVisible();
    await expect(page.locator('#unlockComputer')).not.toBeVisible();
    
    const isUnlocked = await page.evaluate(() => (window as any).game.computer.unlocked);
    expect(isUnlocked).toBe(1);
  });

  test('ice should melt into indoor water', async ({ page }) => {
    await page.evaluate(() => {
        (window as any).game.ice.ice = 1000;
        (window as any).game.water.indoor = 0;
    });

    // Wait for a few ticks (10 ticks per second)
    await page.evaluate(() => {
        for(let i=0; i<10; i++) (window as any).game.tick();
        // Force UI update since tick() doesn't always trigger it in headless
        (window as any).view.update();
    });

    const indoorWater = await page.evaluate(() => (window as any).game.water.indoor);
    expect(indoorWater).toBeGreaterThan(0);
    
    const indoorWaterText = await page.textContent('#indoorWater');
    const parsedWater = parseFloat(indoorWaterText!.replace(/,/g, ''));
    expect(parsedWater).toBeGreaterThan(0);
  });

  test('indoor water should be sold for cash', async ({ page }) => {
    await page.evaluate(() => {
        (window as any).game.water.indoor = 1000;
        (window as any).game.cash = 0;
    });

    await page.evaluate(() => {
        for(let i=0; i<10; i++) (window as any).game.tick();
        (window as any).view.update();
    });

    const cash = await page.evaluate(() => (window as any).game.cash);
    expect(cash).toBeGreaterThan(0);
    
    const cashText = await page.textContent('#cash');
    const parsedCash = parseFloat(cashText!.replace(/,/g, ''));
    expect(parsedCash).toBeGreaterThan(0);
  });

  test('should be able to buy farms', async ({ page }) => {
    await page.evaluate(() => {
        (window as any).game.land.soil = 100;
        (window as any).game.farms.farms = 0;
        (window as any).view.update();
    });

    await page.evaluate(() => {
        const btn = document.getElementById('btnBuyFarms');
        if (btn) btn.click();
    });

    const farms = await page.evaluate(() => (window as any).game.farms.farms);
    expect(farms).toBeGreaterThan(0);
    
    const soil = await page.evaluate(() => (window as any).game.land.soil);
    expect(soil).toBeLessThan(100);
  });

  test('population should grow if there is food', async ({ page }) => {
    await page.evaluate(() => {
        (window as any).game.farms.food = 100;
        (window as any).game.population.people = 0;
        (window as any).view.update();
    });

    await page.evaluate(() => {
        for(let i=0; i<100; i++) (window as any).game.tick();
        (window as any).view.update();
    });

    const people = await page.evaluate(() => (window as any).game.population.people);
    expect(people).toBeGreaterThan(0);
    
    const popText = await page.textContent('#population');
    expect(parseFloat(popText!.replace(/,/g, ''))).toBeGreaterThan(0);
  });

  test('should accept scientific notation in inputs', async ({ page }) => {
    await page.evaluate(() => {
        (window as any).game.land.soil = 1e15;
        (window as any).game.farms.farms = 0;
        (window as any).view.update();
    });

    const input = page.locator('#buyFarmAmount');
    await input.fill('1e2');

    await page.evaluate(() => {
        const btn = document.getElementById('btnBuyFarms');
        if (btn) btn.click();
    });

    const farms = await page.evaluate(() => (window as any).game.farms.farms);
    expect(farms).toBe(100);
  });
});
