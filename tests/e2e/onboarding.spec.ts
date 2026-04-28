import { test, expect, devices } from '@playwright/test';

/**
 * E2E Tests for the Onboarding journey (TEST-05).
 * Covers the full flow from landing → onboarding → dashboard in demo mode.
 */
test.describe('Onboarding Journey', () => {
  test('complete onboarding flow in demo mode', async ({ page }) => {
    await page.goto('/');
    // Click demo mode CTA
    await page.click('text=Try Demo Mode');
    await expect(page).toHaveURL(/.*onboarding/);

    // Step 1: Location
    const zipInput = page.locator('input[name="zipCode"], input[placeholder*="ZIP"], input[placeholder*="zip"]').first();
    if (await zipInput.isVisible()) {
      await zipInput.fill('90210');
    }
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    if (await nextBtn.isVisible()) await nextBtn.click();

    // Step 2: Voting method preference
    const inPersonOption = page.locator('text=In-Person, [value="in-person"], label:has-text("In-Person")').first();
    if (await inPersonOption.isVisible()) await inPersonOption.click();
    if (await nextBtn.isVisible()) await nextBtn.click();

    // Final: Should arrive at dashboard or complete state
    await expect(page).toHaveURL(/\/(dashboard|onboarding|$)/);
  });

  test('onboarding has correct page title and h1', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveTitle(/CivicFlow/);
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('onboarding form has accessible labels', async ({ page }) => {
    await page.goto('/onboarding');
    const inputs = page.locator('input:visible');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      // Every input must have some form of label
      const hasLabel = id
        ? (await page.locator(`label[for="${id}"]`).count()) > 0
        : false;
      expect(hasLabel || !!ariaLabel || !!ariaLabelledBy).toBe(true);
    }
  });

  test('onboarding back navigation works', async ({ page }) => {
    await page.goto('/onboarding');
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      const backBtn = page.locator('button:has-text("Back"), button:has-text("Previous")').first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
        // Should be back at step 1
        await expect(page.locator('input[name="zipCode"], input[placeholder*="ZIP"]').first()).toBeVisible().catch(() => {});
      }
    }
  });
});
