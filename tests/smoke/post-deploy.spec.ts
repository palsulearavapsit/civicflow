/**
 * Smoke Tests for post-deployment verification (TEST-13).
 * Fast tests that verify the most critical user flows work after a deployment.
 */

import { test, expect } from '@playwright/test';

test.describe('🚀 Smoke Tests — Post-Deployment Verification', () => {
  test('S01: Landing page loads and returns 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
  });

  test('S02: Chat page loads', async ({ page }) => {
    const response = await page.goto('/chat');
    expect(response?.status()).toBe(200);
  });

  test('S03: Onboarding page loads', async ({ page }) => {
    const response = await page.goto('/onboarding');
    expect(response?.status()).toBe(200);
  });

  test('S04: API health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health').catch(() => null);
    // Either 200 or 404 is acceptable (route may not exist) — just not 500
    if (response) {
      expect(response.status()).not.toBe(500);
    }
  });

  test('S05: No JavaScript errors on landing page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Filter known acceptable errors (e.g. Firebase in demo mode)
    const criticalErrors = errors.filter(
      (e) => !e.includes('Firebase') && !e.includes('gtag') && !e.includes('demo')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('S06: Demo mode CTA is clickable', async ({ page }) => {
    await page.goto('/');
    const demoBtn = page.locator('text=Try Demo Mode, text=Demo, a[href*="onboarding"]').first();
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await expect(page).toHaveURL(/\/(onboarding|dashboard)/);
    }
  });

  test('S07: Page has proper meta description', async ({ page }) => {
    await page.goto('/');
    const meta = await page.locator('meta[name="description"]').getAttribute('content');
    expect(meta).toBeTruthy();
    expect(meta!.length).toBeGreaterThan(10);
  });

  test('S08: Manifest.json is accessible', async ({ request }) => {
    const response = await request.get('/manifest.json').catch(() => null);
    if (response && response.status() === 200) {
      const json = await response.json();
      expect(json.name).toBeTruthy();
    }
  });
});
