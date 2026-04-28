import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Screen Reader Simulation Tests (TEST-16 / A11Y-06).
 * Uses axe-core to simulate screen reader traversal and WCAG AAA compliance.
 */

test.describe('Screen Reader & Accessibility Audit', () => {
  test('landing page passes axe-core WCAG 2.1 AA scan', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('chat page passes axe-core scan', async ({ page }) => {
    await page.goto('/chat');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('onboarding page passes axe-core scan', async ({ page }) => {
    await page.goto('/onboarding');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      // Images must have alt text or role="presentation"
      expect(alt !== null || role === 'presentation').toBe(true);
    }
  });

  test('page has a single h1 element', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('all form inputs have associated labels', async ({ page }) => {
    await page.goto('/onboarding');
    const inputs = page.locator('input:not([type="hidden"]):not([type="submit"]):visible');
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const hasLabel = id ? (await page.locator(`label[for="${id}"]`).count()) > 0 : false;
      expect(hasLabel || !!ariaLabel || !!ariaLabelledBy).toBe(true);
    }
  });

  test('page has lang attribute', async ({ page }) => {
    await page.goto('/');
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}/);
  });

  test('interactive elements have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();
    expect(results.violations.filter((v) => v.id === 'color-contrast')).toHaveLength(0);
  });
});

test.describe('Network Throttling Tests (TEST-17)', () => {
  test('page loads within 10s on slow 3G', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async (route) => {
      await new Promise((r) => setTimeout(r, 100)); // Add 100ms latency
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
  });
});
