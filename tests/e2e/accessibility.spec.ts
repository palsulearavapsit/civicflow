import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Accessibility (Axe-Core): Homepage', async ({ page }) => {
  await page.goto('/');
  // Implementation Roadmap: 4.7 Accessibility testing with Axe-Core
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
