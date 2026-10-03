const { test, expect } = require('@playwright/test');

test('page contains fullscreen control and click toggles full screen', async ({ page }) => {
  await page.goto('http://localhost:8000/idle-breakout-main/idle-breakout-main/index.html');
  const button = page.locator('#fullscreen-button');
  await expect(button).toBeVisible();
  await expect(button).toContainText('Fullscreen');
  await button.click();
  await page.waitForTimeout(700);
  const fullscreen = await page.evaluate(() => !!document.fullscreenElement);
  expect(fullscreen).toBeTruthy();
  await expect(page.locator('#fullscreen-button')).toContainText('Exit Fullscreen');
});
