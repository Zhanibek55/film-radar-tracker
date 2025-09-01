import { test, expect } from '@playwright/test';

test.describe('Film Radar - Main Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForTimeout(1000);
  });

  test('should load the main page', async ({ page }) => {
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Film Radar/);
    
    // Check if main heading is visible
    await expect(page.getByRole('heading', { name: 'Film Radar' })).toBeVisible();
    
    // Check if description is present
    await expect(page.getByText('Отслеживание новых фильмов и сериалов в хорошем качестве')).toBeVisible();
  });

  test('should have all navigation tabs', async ({ page }) => {
    // Check if all tabs are present
    await expect(page.getByRole('tab', { name: 'Свежие' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Качество' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Фильмы' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Сериалы' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Топ рейтинг' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Все' })).toBeVisible();
  });

  test('should default to "Свежие" tab', async ({ page }) => {
    // Check if "Свежие" tab is selected by default
    const freshTab = page.getByRole('tab', { name: 'Свежие' });
    await expect(freshTab).toHaveAttribute('data-state', 'active');
  });

  test('should be able to switch between tabs', async ({ page }) => {
    // Switch to "Фильмы" tab
    await page.getByRole('tab', { name: 'Фильмы' }).click();
    await expect(page.getByRole('tab', { name: 'Фильмы' })).toHaveAttribute('data-state', 'active');
    
    // Switch to "Сериалы" tab
    await page.getByRole('tab', { name: 'Сериалы' }).click();
    await expect(page.getByRole('tab', { name: 'Сериалы' })).toHaveAttribute('data-state', 'active');
    
    // Switch to "Качество" tab
    await page.getByRole('tab', { name: 'Качество' }).click();
    await expect(page.getByRole('tab', { name: 'Качество' })).toHaveAttribute('data-state', 'active');
  });

  test('should have refresh button', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: 'Обновить' });
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();
  });

  test('should show loading state initially', async ({ page }) => {
    // Check if skeleton loading is shown initially
    const skeletons = page.locator('[data-testid="skeleton"], .animate-pulse');
    
    // Wait a bit to see if skeletons appear
    await page.waitForTimeout(100);
    
    // Should either show skeletons or content
    const hasSkeletons = await skeletons.count() > 0;
    const hasContent = await page.locator('[data-testid="movie-card"]').count() > 0;
    
    expect(hasSkeletons || hasContent).toBeTruthy();
  });
});

test.describe('Film Radar - Movie Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for content to load
    await page.waitForTimeout(2000);
  });

  test('should display movie cards when data is available', async ({ page }) => {
    // Wait for either movie cards or empty state
    await page.waitForSelector('[data-testid="movie-card"], .text-center', { timeout: 10000 });
    
    const movieCards = page.locator('[data-testid="movie-card"]');
    const emptyState = page.locator('.text-center:has-text("Пока нет")');
    
    const cardCount = await movieCards.count();
    const hasEmptyState = await emptyState.count() > 0;
    
    if (cardCount > 0) {
      // If we have movie cards, test their structure
      const firstCard = movieCards.first();
      
      // Should have poster image
      await expect(firstCard.locator('img')).toBeVisible();
      
      // Should have title
      await expect(firstCard.locator('h3')).toBeVisible();
      
      // Should have movie/series type icon
      await expect(firstCard.locator('svg')).toBeVisible();
      
    } else if (hasEmptyState) {
      // If no content, should show appropriate empty state message
      await expect(emptyState).toBeVisible();
    }
  });

  test('should show quality badges on movie cards', async ({ page }) => {
    const movieCards = page.locator('[data-testid="movie-card"]');
    const cardCount = await movieCards.count();
    
    if (cardCount > 0) {
      const firstCard = movieCards.first();
      
      // Should have quality badge or other badges
      const badges = firstCard.locator('.badge, [class*="badge"]');
      const badgeCount = await badges.count();
      
      // Expect at least one badge (quality, type, or fresh indicator)
      expect(badgeCount).toBeGreaterThan(0);
    }
  });

  test('should show IMDB ratings when available', async ({ page }) => {
    const movieCards = page.locator('[data-testid="movie-card"]');
    const cardCount = await movieCards.count();
    
    if (cardCount > 0) {
      // Look for IMDB rating elements
      const ratingElements = page.locator('[data-testid="imdb-rating"], .text-rating-gold');
      const ratingCount = await ratingElements.count();
      
      // Some cards should have ratings (not all might have them)
      console.log(`Found ${ratingCount} rating elements out of ${cardCount} cards`);
    }
  });
});

test.describe('Film Radar - Fresh Content Logic', () => {
  test('should show appropriate content in Fresh tab', async ({ page }) => {
    await page.goto('/');
    
    // Ensure Fresh tab is selected
    await page.getByRole('tab', { name: 'Свежие' }).click();
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Should either show fresh content or empty state with appropriate message
    const emptyState = page.locator('.text-center:has-text("свежих релизов")');
    const movieCards = page.locator('[data-testid="movie-card"]');
    
    const hasEmpty = await emptyState.count() > 0;
    const hasCards = await movieCards.count() > 0;
    
    expect(hasEmpty || hasCards).toBeTruthy();
    
    if (hasEmpty) {
      await expect(emptyState).toContainText('последние 7 дней для фильмов, 3 дня для сериалов');
    }
  });

  test('should show fresh indicators on recent content', async ({ page }) => {
    await page.goto('/');
    
    // Look for "НОВОЕ" badges
    const freshBadges = page.locator('text="НОВОЕ"');
    const freshBadgeCount = await freshBadges.count();
    
    console.log(`Found ${freshBadgeCount} fresh indicators`);
    
    if (freshBadgeCount > 0) {
      // Fresh badges should be visible
      await expect(freshBadges.first()).toBeVisible();
    }
  });
});

test.describe('Film Radar - Quality Tab', () => {
  test('should filter high quality content in Quality tab', async ({ page }) => {
    await page.goto('/');
    
    // Switch to Quality tab
    await page.getByRole('tab', { name: 'Качество' }).click();
    
    // Wait for filtering
    await page.waitForTimeout(1000);
    
    // Should show either quality content or appropriate empty message
    const emptyState = page.locator('.text-center:has-text("высоком качестве")');
    const movieCards = page.locator('[data-testid="movie-card"]');
    
    const hasEmpty = await emptyState.count() > 0;
    const hasCards = await movieCards.count() > 0;
    
    expect(hasEmpty || hasCards).toBeTruthy();
    
    if (hasEmpty) {
      await expect(emptyState).toContainText('1080p+ WEB-DL/BluRay');
    }
  });
});

test.describe('Film Radar - Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Main content should be visible
    await expect(page.getByRole('heading', { name: 'Film Radar' })).toBeVisible();
    
    // Tabs should be visible and scrollable
    await expect(page.getByRole('tab', { name: 'Свежие' })).toBeVisible();
    
    // Grid should adapt to mobile (fewer columns)
    const grid = page.locator('.grid');
    if (await grid.count() > 0) {
      // Should have mobile grid classes
      const hasResponsiveGrid = await grid.locator('.grid-cols-2').count() > 0;
      expect(hasResponsiveGrid).toBeTruthy();
    }
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // All elements should be properly sized
    await expect(page.getByRole('heading', { name: 'Film Radar' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Свежие' })).toBeVisible();
  });
});

test.describe('Film Radar - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept network requests and simulate failure
    await page.route('**/rest/v1/**', route => route.abort());
    
    await page.goto('/');
    
    // Should show some error state or empty state
    await page.waitForTimeout(3000);
    
    // App should not crash and should show some content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Should show either loading, error, or empty state
    const hasContent = await page.locator('text="Film Radar"').count() > 0;
    expect(hasContent).toBeTruthy();
  });
});