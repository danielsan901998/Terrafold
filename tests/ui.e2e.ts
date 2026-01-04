import { test, expect } from '@playwright/test';

test.describe('UI Interactions and Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mainContainer');
  });

  test('should handle sliders and computer upgrades', async ({ page }) => {
    // 1. Sliders
    await page.fill('#scienceSlider', '75');
    expect(await page.evaluate(() => (window as any).game.population.scienceRatio)).toBe(75);
    
    await page.fill('#farmSlider', '30');
    expect(await page.evaluate(() => (window as any).game.farms.farmRatio)).toBe(30);

    // 2. Computer upgrades
    await page.evaluate(() => {
        const game = (window as any).game;
        game.science = 1000000;
        game.cash = 1000000;
        game.computer.unlockComputer();
        (window as any).view.computerView.checkUnlocked();
    });

    const initialThreads = parseInt(await page.textContent('#threads') || '0');
    await page.click('#buyThread');
    expect(parseInt(await page.textContent('#threads') || '0')).toBe(initialThreads + 1);

    const initialSpeed = parseInt(await page.textContent('#speed') || '0');
    await page.click('#buySpeed');
    expect(parseInt(await page.textContent('#speed') || '0')).toBe(initialSpeed + 1);
  });

  test('should handle visibility of processes and jobs', async ({ page }) => {
    await page.evaluate(() => (window as any).pauseGame());

    // 1. Robots unlock visibility
    await expect(page.locator('#robotsContainer')).toBeHidden();
    await page.evaluate(() => (window as any).game.robots.unlockRobots());
    await expect(page.locator('#robotRow0Container')).not.toHaveClass(/hidden/);

    // 2. Computer processes completion (Bigger Storms)
    await page.evaluate(() => {
        (window as any).game.science = 1000;
        (window as any).game.computer.unlockComputer();
        const proc = (window as any).game.computer.processes.find((p: any) => p.text === "Bigger Storms");
        (window as any).game.clouds.initialStormDuration = 300;
        proc.threads = 1;
        (window as any).game.tick();
        (window as any).view.update();
    });
    
    const biggerStormsIndex = await page.evaluate(() => 
        (window as any).game.computer.processes.findIndex((p: any) => p.text === "Bigger Storms")
    );
    await expect(page.locator(`#computerRow${biggerStormsIndex}Container`)).toBeHidden();

    // 3. Computer processes completion (Improve Ship engines)
    await page.evaluate(() => {
        (window as any).game.spaceDock.unlocked = 1;
        (window as any).game.spaceDock.defaultSpeed = 1.0;
        const proc = (window as any).game.computer.processes.find((p: any) => p.text === "Improve Ship engines");
        proc.threads = 1;
        (window as any).game.tick();
        (window as any).view.update();
    });

    const improveEnginesIndex = await page.evaluate(() => 
        (window as any).game.computer.processes.findIndex((p: any) => p.text === "Improve Ship engines")
    );
    await expect(page.locator(`#computerRow${improveEnginesIndex}Container`)).toBeHidden();
  });

  test('should handle scientific notation in inputs', async ({ page }) => {
    await page.evaluate(() => {
        (window as any).game.metal = 500;
        (window as any).game.energy.unlockEnergy();
        (window as any).game.oxygen = 1e15;
        (window as any).game.science = 1e15;
        document.getElementById('energyContainer')?.classList.remove('hidden');
        (window as any).view.refreshLayout();
    });
    
    await page.fill('#buyBattery', '1e2');
    await page.dispatchEvent('#buyBattery', 'input');
    await page.evaluate(() => (window as any).game.buyBattery());
    
    expect(await page.evaluate(() => (window as any).game.energy.battery)).toBe(200);
  });
});
