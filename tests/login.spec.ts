import { test, expect } from '@playwright/test';

test('Login page shows the email and password fields', async ({ page }) => {
  await page.goto('/login'); // Use relative path, baseURL is set in config

  await expect(page.getByLabel('Email', { exact: true })).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible({ timeout: 10000 });
});
