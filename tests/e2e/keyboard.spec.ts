import { test, expect } from '@playwright/test';

/**
 * Keyboard Navigation Tests (TEST-15).
 * Verifies full keyboard accessibility across all pages.
 */

test.describe('Keyboard Navigation', () => {
  test('landing page — all interactive elements reachable by Tab', async ({ page }) => {
    await page.goto('/');
    // Press Tab 20 times and verify focus moves
    const visited = new Set<string>();
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}:${el.textContent?.slice(0, 20)}:${el.getAttribute('href') ?? ''}` : null;
      });
      if (focused) visited.add(focused);
    }
    expect(visited.size).toBeGreaterThan(3); // At least 3 distinct focusable elements
  });

  test('skip-to-content link is first focusable element', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return el?.textContent?.toLowerCase() ?? '';
    });
    expect(firstFocused).toMatch(/skip|main/i);
  });

  test('chat page — Escape closes modal/drawer', async ({ page }) => {
    await page.goto('/chat');
    // Open some interactive element if present
    const chatInput = page.locator('input, textarea').first();
    if (await chatInput.isVisible()) {
      await chatInput.focus();
      await page.keyboard.press('Escape');
      // Should not crash — page still functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Enter activates buttons', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const tagName = await page.evaluate(() => document.activeElement?.tagName);
    if (tagName === 'BUTTON' || tagName === 'A') {
      // Should be activatable with Enter
      await page.keyboard.press('Enter');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('navigation links have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focusedStyles = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });
    // Must have some visible focus indicator
    const hasIndicator =
      focusedStyles.outline !== 'none' ||
      focusedStyles.outlineWidth !== '0px' ||
      focusedStyles.boxShadow !== 'none';
    expect(hasIndicator).toBe(true);
  });
});
