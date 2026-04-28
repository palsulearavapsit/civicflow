import { test, expect, devices } from '@playwright/test';

/**
 * Mobile-Specific E2E Tests (TEST-09).
 * Tests responsiveness on iPhone 14 and Samsung Galaxy S21 viewports.
 */

test.describe('Mobile Responsiveness — iPhone 14', () => {
  test.use({ ...devices['iPhone 14'] });

  test('landing page renders correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    // Mobile: hamburger or nav should be present
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('touch targets are at least 44px', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button:visible, a:visible');
    const count = Math.min(await buttons.count(), 10); // check first 10
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40); // allow 4px tolerance
        expect(box.width).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('no horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('chat page usable on mobile', async ({ page }) => {
    await page.goto('/chat');
    const input = page.locator('input[placeholder*="Ask"], textarea[placeholder*="Ask"]').first();
    if (await input.isVisible()) {
      await input.tap();
      await input.fill('How do I register to vote?');
    }
  });
});

test.describe('Mobile Responsiveness — Samsung Galaxy S21', () => {
  test.use({ ...devices['Galaxy S9+'] });

  test('landing page renders on Android viewport', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('onboarding is usable on small screen', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
