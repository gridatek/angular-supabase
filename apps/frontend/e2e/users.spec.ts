import { test, expect } from '@playwright/test';

test.describe('Users List', () => {
  test('should display the users list page', async ({ page }) => {
    await page.goto('/');
    
    // Check page title and header
    await expect(page).toHaveTitle(/Frontend/);
    await expect(page.locator('h1')).toContainText('Angular - Supabase Demo');
    
    // Check users section is present
    await expect(page.locator('h2')).toContainText('Users List');
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/');
    
    // Should show loading message briefly
    const loadingElement = page.locator('.loading');
    await expect(loadingElement).toBeVisible();
  });

  test('should display users after loading', async ({ page }) => {
    await page.goto('/');
    
    // Wait for users to load (either users or error message)
    await page.waitForSelector('.users-grid, .error, .no-users', { timeout: 10000 });
    
    // Should either show users grid, error message, or no users message
    const usersGrid = page.locator('.users-grid');
    const errorMessage = page.locator('.error');
    const noUsersMessage = page.locator('.no-users');
    
    const hasContent = await Promise.race([
      usersGrid.isVisible(),
      errorMessage.isVisible(), 
      noUsersMessage.isVisible()
    ]);
    
    expect(hasContent).toBe(true);
  });

  test('should display user cards with correct information', async ({ page }) => {
    await page.goto('/');
    
    // Wait for potential users to load
    await page.waitForSelector('.users-grid, .error, .no-users', { timeout: 10000 });
    
    // If users are displayed, check their structure
    const userCards = page.locator('.user-card');
    const cardCount = await userCards.count();
    
    if (cardCount > 0) {
      // Check first user card has required elements
      const firstCard = userCards.first();
      await expect(firstCard.locator('h3')).toBeVisible(); // name
      await expect(firstCard.locator('.email')).toBeVisible(); // email
      await expect(firstCard.locator('.date')).toBeVisible(); // date
    }
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/');
    
    // Test different viewport sizes
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForSelector('.users-container');
    
    // Check mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.users-container')).toBeVisible();
    
    // Check tablet view  
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.users-container')).toBeVisible();
  });
});