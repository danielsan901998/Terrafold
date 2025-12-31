import { test, expect } from '@playwright/test';

test.describe('Import/Export', () => {
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

    const initialComputerRows = await page.locator('.computerRow').count();
    const initialRobotRows = await page.locator('.robotRow').count();

    await page.evaluate((content) => {
        const el = document.getElementById('exportImportSave') as HTMLTextAreaElement;
        if (el) el.value = content;
        const btn = document.getElementById('btnImport');
        if (btn) btn.click();
    }, saveContent);

    // Wait for the rows to be added and visible
    await page.waitForSelector('.computerRow', { state: 'attached' });
    await page.waitForSelector('.robotRow', { state: 'attached' });

    const computerRowsAfter = await page.locator('.computerRow').count();
    const robotRowsAfter = await page.locator('.robotRow').count();

    expect(computerRowsAfter, 'Computer rows should not be duplicated').toBe(9);
    expect(robotRowsAfter, 'Robot rows should not be duplicated').toBe(6);
  });
});
