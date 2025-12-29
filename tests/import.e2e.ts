import { test, expect } from '@playwright/test';

test.describe('Terrafold Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mainContainer');
  });

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

    // 1. Initial count (may be 0 or initialized if game auto-starts)
    const initialComputerRows = await page.locator('.computerRow').count();
    const initialRobotRows = await page.locator('.robotRow').count();

    // 2. Import the save
    await page.evaluate((content) => {
        const el = document.getElementById('exportImportSave') as HTMLTextAreaElement;
        if (el) el.value = content;
        const btn = document.getElementById('btnImport');
        if (btn) btn.click();
    }, saveContent);

    // 3. Verify counts - should be exactly what's in the game (9 computer processes, 6 robot jobs)
    const computerRowsAfter = await page.locator('.computerRow').count();
    const robotRowsAfter = await page.locator('.robotRow').count();

    expect(computerRowsAfter, 'Computer rows should not be duplicated').toBe(9);
    expect(robotRowsAfter, 'Robot rows should not be duplicated').toBe(6);
  });
});
