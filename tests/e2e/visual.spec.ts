import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

/**
 * TEST-02: Visual Regression Testing with Percy.
 * Ensures the UI remains pixel-perfect across all major pages.
 */
test.describe('Visual Regression', () => {
  test('Dashboard page looks correct', async ({ page }) => {
    // Go to dashboard (demo mode should bypass real auth for testing)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Take a Percy snapshot
    await percySnapshot(page, 'Dashboard Page');
  });

  test('Onboarding flow looks correct', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'Onboarding - Step 1');
    
    // Move to next step
    await page.click('button:has-text("Continue")');
    await percySnapshot(page, 'Onboarding - Step 2');
  });

  test('AI Chat looks correct', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'AI Chat Interface');
  });
});
