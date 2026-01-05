import { test, expect } from '@playwright/test';

test.describe('Core Game Systems', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mainContainer');
  });

  test('should initialize and tick correctly', async ({ page }) => {
    // 1. Initialization checks
    const errors: any[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', (error) => errors.push(error));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const isGameInitialized = await page.evaluate(() => (window as any).game !== undefined);
    expect(isGameInitialized).toBe(true);

    const expectedElements = ['#totalWater', '#cash', '#iceContainer', '#landContainer', '#populationContainer'];
    for (const selector of expectedElements) {
      await expect(page.locator(selector)).toBeVisible();
    }

    // 2. Ticking check
    await page.evaluate(() => {
      (window as any).game.ice.buyable = 0;
      (window as any).game.ice.gain = 10;
    });
    await page.waitForTimeout(200);
    const buyableIce = await page.evaluate(() => (window as any).game.ice.buyable);
    expect(buyableIce).toBeGreaterThan(0);

    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should handle core gameplay mechanics and settings', async ({ page }) => {
    await page.evaluate(() => (window as any).pauseGame());

    // 1. Ice buying and begging
    await page.evaluate(() => {
        (window as any).game.cash = 100;
        (window as any).game.ice.buyable = 100;
        (window as any).game.ice.ice = 0;
        (window as any).view.update();
    });

    await page.click('#btnBuyIce');
    const cashAfterBuy = await page.evaluate(() => (window as any).game.cash);
    expect(cashAfterBuy).toBeLessThan(100);
    expect(await page.evaluate(() => (window as any).game.ice.ice)).toBeGreaterThan(0);

    await page.locator('.infoText').nth(2).hover();
    await page.click('#btnBeg');
    expect(await page.evaluate(() => (window as any).game.cash)).toBeCloseTo(cashAfterBuy + 0.1, 5);

    // 2. Resource conversion (Ice -> Water -> Cash)
    await page.evaluate(() => {
        (window as any).game.ice.ice = 1000;
        (window as any).game.water.indoor = 0;
        (window as any).game.cash = 0;
        for(let i=0; i<10; i++) (window as any).game.tick();
        (window as any).view.update();
    });
    expect(await page.evaluate(() => (window as any).game.water.indoor)).toBeGreaterThan(0);
    expect(await page.evaluate(() => (window as any).game.cash)).toBeGreaterThan(0);

    // 3. Farms and Population
    await page.evaluate(() => {
        (window as any).game.land.soil = 100;
        (window as any).game.farms.food = 100;
        (window as any).game.farms.farmRatio = 0.5;
        for(let i=0; i<100; i++) (window as any).game.tick();
        (window as any).view.update();
    });
    expect(await page.evaluate(() => (window as any).game.population.people)).toBeGreaterThan(0);

    // 4. Max Mines setting synchronization
    await page.evaluate(() => {
        (window as any).game.hangarContainerVisible = true;
        document.getElementById('hangarContainer')?.classList.remove('hidden');
        (window as any).game.space.newLevel();
        (window as any).view.refreshLayout();
        (window as any).game.tick();
    });
    await page.fill('#maxMinesInput', '15');
    await page.dispatchEvent('#maxMinesInput', 'change');
    await page.evaluate(() => (window as any).game.tick());
    expect(await page.evaluate(() => (window as any).game.hangar.maxMines)).toBe(15);
    expect(await page.evaluate(() => (window as any).game.space.planets[0].maxMines)).toBe(15);
  });

  test('should maintain integrity after import', async ({ page }) => {
    // 1. Setup existing state with comets
    await page.evaluate(() => {
        const g = (window as any).game;
        const v = (window as any).view;
        g.tractorBeam.unlocked = 1;
        document.getElementById('tractorBeamContainer')?.classList.remove('hidden');
        v.tractorBeamView.checkUnlocked();
        g.tractorBeam.addComet();
        g.power = 1e6;
        g.tractorBeam.tick(); // Populate takeAmount
        v.update();
        v.refreshLayout();
    });

    await expect(page.locator('.comet-row').first()).toBeVisible();
    await expect(page.locator('#cometsContainer div:not(.hidden)').first()).toBeVisible();
    await expect(page.locator('#takeAmountContainer')).not.toBeEmpty();

    // 2. Import new save
    const saveContent = JSON.stringify({
        "cash": 1000,
        "science": 1000,
        "computer": {
            "unlocked": 1,
            "threads": 10,
            "processes": Array(9).fill({workers: 0, currentTicks: 0, ticksNeeded: 100})
        },
        "robots": {
            "unlocked": 1,
            "jobs": Array(6).fill({workers: 0})
        },
        "tractorBeam": {
            "unlocked": 1,
            "comets": []
        }
    });

    await page.evaluate((content) => {
        const el = document.getElementById('exportImportSave') as HTMLTextAreaElement;
        if (el) el.value = content;
        const btn = document.getElementById('btnImport');
        if (btn) btn.click();
    }, saveContent);

    // 3. Verify integrity
    await page.waitForSelector('.computerRow', { state: 'attached' });
    expect(await page.locator('.computerRow').count()).toBe(10);
    expect(await page.locator('.robotRow').count()).toBe(6);

    // 4. Verify comet cleanup
    await page.evaluate(() => (window as any).view.update());
    await expect(page.locator('.comet-row')).not.toBeVisible();
    await expect(page.locator('#cometsContainer div:not(.hidden)')).not.toBeVisible();
    await expect(page.locator('#takeAmountContainer')).toBeEmpty();
    expect(await page.evaluate(() => (window as any).game.tractorBeam.comets.length)).toBe(0);
  });
});
