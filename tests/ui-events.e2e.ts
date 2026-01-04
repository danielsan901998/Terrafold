import { test, expect } from '@playwright/test';

test.describe('UI Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mainContainer');
  });

  test('should update thread count in UI when thread is bought', async ({ page }) => {
    // Unlock computer first
    await page.evaluate(() => {
        const game = (window as any).game;
        const view = (window as any).view;
        game.science = 1000;
        game.computer.unlockComputer();
        game.cash = 1000000;
        view.computerView.checkUnlocked();
    });

    const initialThreads = await page.locator('#threads').textContent();
    
    // Click buy thread
    await page.click('#buyThread');

    const updatedThreads = await page.locator('#threads').textContent();
    expect(parseInt(updatedThreads!)).toBe(parseInt(initialThreads!) + 1);
    
    const freeThreads = await page.locator('#freeThreads').textContent();
    expect(parseInt(freeThreads!)).toBe(parseInt(initialThreads!) + 1);
  });

  test('should reflect science ratio slider change', async ({ page }) => {
    const slider = page.locator('#scienceSlider');
    await slider.fill('75');
    
    const ratio = await page.evaluate(() => (window as any).game.population.scienceRatio);
    expect(ratio).toBe(75);
  });

  test('should reflect farm ratio slider change', async ({ page }) => {
    const slider = page.locator('#farmSlider');
    await slider.fill('30');
    
    const ratio = await page.evaluate(() => (window as any).game.farms.farmRatio);
    expect(ratio).toBe(30);
  });

  test('should update computer speed in UI when speed is bought', async ({ page }) => {
    await page.evaluate(() => {
        const game = (window as any).game;
        const view = (window as any).view;
        game.science = 1000000;
        game.computer.unlockComputer();
        view.computerView.checkUnlocked();
    });

    const initialSpeed = await page.locator('#speed').textContent();
    await page.click('#buySpeed');
    
    const updatedSpeed = await page.locator('#speed').textContent();
    expect(parseInt(updatedSpeed!)).toBe(parseInt(initialSpeed!) + 1);
  });

  test('should show/hide robot job rows based on unlock condition', async ({ page }) => {
    // 1. Initial state: robots hidden
    await expect(page.locator('#robotsContainer')).toBeHidden();

    // 2. Unlock robots
    await page.evaluate(() => {
        const game = (window as any).game;
        game.cash = 3000;
        game.robots.unlockRobots();
    });

    const jobRowSelector = '#robotRow0Container';
    // It should not have 'hidden' class now
    const hasHiddenClass = await page.locator(jobRowSelector).evaluate(el => el.classList.contains('hidden'));
    expect(hasHiddenClass).toBe(false);
  });

  test('should hide "Bigger Storms" process when done', async ({ page }) => {
    // Pause game to have full control
    await page.evaluate(() => (window as any).pauseGame());

    // 1. Unlock Computer
    await page.evaluate(() => {
        (window as any).game.science = 1000;
        (window as any).game.computer.unlockComputer();
        (window as any).view.update();
    });

    await expect(page.locator('#unlockedComputer')).toBeVisible();

    // 2. Locate "Bigger Storms" row
    const biggerStormsRowIndex = await page.evaluate(() => {
        return (window as any).game.computer.processes.findIndex((p: any) => p.text === "Bigger Storms");
    });
    expect(biggerStormsRowIndex).toBeGreaterThan(-1);

    const rowSelector = `#computerRow${biggerStormsRowIndex}Container`;
    await expect(page.locator(rowSelector)).toBeVisible();

    // 3. Mark it as done
    await page.evaluate(() => {
        const game = (window as any).game;
        const proc = game.computer.processes.find((p: any) => p.text === "Bigger Storms");
        
        // Satisfy done condition
        game.clouds.initialStormDuration = 300;
				proc.threads = 1;
        
        // Trigger a tick. tickRow will see done() is true, 
        game.tick(); 
    });

    // 4. Verify it is hidden
    await expect(page.locator(rowSelector)).toBeHidden();
  });

  test('should hide "Improve Ship engines" process when done', async ({ page }) => {
    // Pause game
    await page.evaluate(() => (window as any).pauseGame());

    // 1. Unlock Computer and Space Dock
    await page.evaluate(() => {
        const game = (window as any).game;
        const view = (window as any).view;
        game.science = 1000;
        game.computer.unlockComputer();
        game.tractorBeam.unlocked = 1; // This might be needed for spaceDock to be truly "unlocked" in some logic
        game.spaceDock.unlocked = 1;
        view.computerView.checkUnlocked();
        view.computerView.updateThreads();
        view.update();
    });

    // 2. Locate "Improve Ship engines" row
    const improveEnginesRowIndex = await page.evaluate(() => {
        return (window as any).game.computer.processes.findIndex((p: any) => p.text === "Improve Ship engines");
    });
    expect(improveEnginesRowIndex).toBeGreaterThan(-1);

    const rowSelector = `#computerRow${improveEnginesRowIndex}Container`;
    await expect(page.locator(rowSelector)).toBeVisible();

    // 3. Mark it as done
    await page.evaluate(() => {
        const game = (window as any).game;
        const proc = game.computer.processes.find((p: any) => p.text === "Improve Ship engines");

        // Improve Ship engines condition: game.spaceDock.defaultSpeed >= 1.0
        game.spaceDock.defaultSpeed = 1.0;
				proc.threads = 1;
        
        game.tick();
    });

    // 4. Verify it is hidden
    await expect(page.locator(rowSelector)).toBeHidden();
  });
});
