import { test, expect } from '@playwright/test';

/**
 * TEST-03: Chaos Engineering — Firebase Failure Simulation.
 * Verifies that the application fails gracefully when the backend is unreachable.
 */
test.describe('Chaos Engineering', () => {
  test('Dashboard shows error when Firebase Firestore fails', async ({ page }) => {
    // Intercept Firestore requests and fail them
    await page.route('**/google.firestore.**', route => route.abort('failed'));
    
    await page.goto('/dashboard');
    
    // Expect an error boundary or specific error message
    // Note: This assumes an ErrorBoundary component exists and catches the failure
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/trouble connecting/i)).toBeVisible();
  });

  test('AI Chat handles API timeouts gracefully', async ({ page }) => {
    // Intercept AI stream and delay it indefinitely
    await page.route('/api/chat/stream', async route => {
      await new Promise(resolve => setTimeout(resolve, 60000)); // 60s timeout
      await route.abort('timedout');
    });

    await page.goto('/chat');
    await page.fill('input', 'Hello?');
    await page.click('button[aria-label="Send message"]');

    // Wait for internal timeout (usually 10-30s)
    await expect(page.getByText(/having trouble connecting/i)).toBeVisible({ timeout: 35000 });
  });
});
