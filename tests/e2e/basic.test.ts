import { test, expect } from '@playwright/test';

test('landing page loads and has main heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Vote with Confidence');
});

test('navigation to onboarding works in demo mode', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Try Demo Mode');
  await expect(page).toHaveURL(/.*onboarding/);
});

test('chat copilot page basic UI', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.locator('h1')).toContainText('Election Copilot');
  await expect(page.locator('input[placeholder*="Ask about deadlines"]')).toBeVisible();
});
