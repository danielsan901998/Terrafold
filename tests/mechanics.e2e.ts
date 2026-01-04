import { test, expect } from '@playwright/test';

test.describe('Gameplay Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mainContainer');
  });

  test('should handle core gameplay mechanics', async ({ page }) => {
    // Pause game to have full control over ticks
    await page.evaluate(() => (window as any).pauseGame());

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
        const slider = document.getElementById('farmSlider') as HTMLInputElement;
        if (slider) {
            slider.value = '50';
            slider.dispatchEvent(new Event('input'));
        }
        (window as any).game.tick(); // Tick to process ratio
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
    const unlockError = await page.evaluate(() => {
        try {
            (window as any).game.science = 1000;
            (window as any).view.update();
            const btn = document.getElementById('unlockComputer');
            if (!btn) return "unlockComputer button not found";
            btn.click();
            return null;
        } catch (e: any) {
            return e.message + "\n" + e.stack;
        }
    });
    expect(unlockError).toBeNull();
    await expect(page.locator('#unlockedComputer')).toBeVisible();
    expect(await page.evaluate(() => (window as any).game.computer.unlocked)).toBe(1);

    // Verify that processes with showing: false are hidden
    const hiddenProcessVisible = await page.evaluate(() => {
        const robotsUnlocked = (window as any).game.robots.unlocked;
        if (robotsUnlocked !== 0) return "Robots should not be unlocked yet";
        
        // 'computerRow6Container' is "Build Robots" which has showing: false when robots are not unlocked
        const row6 = document.getElementById('computerRow6Container');
        if (!row6) return "computerRow6Container not found";
        return window.getComputedStyle(row6).display !== 'none';
    });
    expect(hiddenProcessVisible, 'Process with showing: false should be hidden (display: none)').toBe(false);

    // 5. Scientific notation in inputs (using science slider or others as farms uses ratio now)
    await page.evaluate(() => {
        (window as any).game.land.soil = 1e15;
        (window as any).game.farms.farms = 0;
        (window as any).game.farms.farmRatio = 0;
        (window as any).view.update();
    });
    // Let's use buyBattery as a test for scientific notation
    await page.evaluate(() => {
        (window as any).game.metal = 500;
        (window as any).game.energy.unlockEnergy();
        document.getElementById('energyContainer')?.classList.remove('hidden');
        (window as any).view.refreshLayout();
        
        const input = document.getElementById('buyBattery') as HTMLInputElement;
        if (input) {
            input.value = '1e2';
            input.dispatchEvent(new Event('input'));
        }
        (window as any).game.oxygen = 1e15;
        (window as any).game.science = 1e15;
        (window as any).game.buyBattery();
    });
    expect(await page.evaluate(() => (window as any).game.energy.battery)).toBe(200); // 100 initial + 100
  });

  test('should allow setting max mines globally', async ({ page }) => {
    await page.evaluate(() => (window as any).pauseGame());

    // Unlock hangar to see the max mines input
    await page.evaluate(() => {
        (window as any).game.hangarContainerVisible = true;
        document.getElementById('hangarContainer')?.classList.remove('hidden');
        (window as any).view.refreshLayout();
    });

    const maxMinesInput = page.locator('#maxMinesInput');
    await expect(maxMinesInput).toBeVisible();

    // Set max mines to 5
    await maxMinesInput.fill('5');
    await maxMinesInput.dispatchEvent('change');

    expect(await page.evaluate(() => (window as any).game.hangar.maxMines)).toBe(5);

    // Create a planet and check its max mines
    await page.evaluate(() => {
        (window as any).game.space.newLevel();
        (window as any).game.tick(); // Tick to synchronize
    });

    const planetMaxMines = await page.evaluate(() => (window as any).game.space.planets[0].maxMines);
    expect(planetMaxMines).toBe(5);

    // Change max mines to 20 and check synchronization
    await maxMinesInput.fill('20');
    await maxMinesInput.dispatchEvent('change');
    await page.evaluate(() => (window as any).game.tick());

    const planetMaxMinesUpdated = await page.evaluate(() => (window as any).game.space.planets[0].maxMines);
    expect(planetMaxMinesUpdated).toBe(20);
  });
});
