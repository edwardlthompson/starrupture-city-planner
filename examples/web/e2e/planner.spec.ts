import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Planner — Sprint 2: Unlock Checklist + Building Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-planner-open]').click();
    await expect(page.locator('[data-testid="planner-panel"]')).toBeVisible();
  });

  test('renders the planner dialog with checklist and library sections', async ({ page }) => {
    const panel = page.locator('[data-testid="planner-panel"]');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('heading', { level: 2, name: 'StarRupture City Planner' })).toBeVisible();

    await expect(page.locator('[data-testid="planner-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="unlock-checklist"]')).toBeVisible();
    await expect(page.locator('[data-testid="building-library"]')).toBeVisible();
    await expect(page.locator('[data-testid="checklist-count"]')).toHaveText('0 of 12 unlocked');
  });

  test('lists all 12 buildings in unlock order, all locked initially', async ({ page }) => {
    const items = page.locator('[data-testid="checklist-list"] > li');
    await expect(items).toHaveCount(12);

    // First item is the Westernmost (order 1); all start locked.
    await expect(items.first()).toContainText('Foundation');
    await expect(items.first()).toContainText('Locked');
    await expect(page.locator('[data-testid="checklist-list"] li.planner-item--unlocked')).toHaveCount(0);
  });

  test('lists all 12 buildings in the library grid', async ({ page }) => {
    const cards = page.locator('[data-testid="library-grid"] > .planner-card');
    await expect(cards).toHaveCount(12);
    await expect(cards.first()).toContainText('Foundation');
    await expect(cards.last()).toContainText('Vault');
  });

  test('tapping a checklist entry unlocks it and every earlier building', async ({ page }) => {
    // Order 5 = Greenhouse.
    const greenhouse = page.locator('[data-testid="checklist-list"] li').filter({ hasText: 'Greenhouse' });
    await expect(greenhouse).toContainText('Locked');
    await greenhouse.click();

    await expect(page.locator('[data-testid="checklist-count"]')).toHaveText('5 of 12 unlocked');
    await expect(page.locator('[data-testid="checklist-list"] li.planner-item--unlocked')).toHaveCount(5);

    // The library reflects the unlock state.
    const lockedCards = page.locator('[data-testid="library-grid"] .planner-card--locked');
    await expect(lockedCards).toHaveCount(7);
  });

  test('search filters the checklist to matching buildings', async ({ page }) => {
    const search = page.locator('[data-testid="planner-search"]');
    await search.fill('reactor');

    const items = page.locator('[data-testid="checklist-list"] > li');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Reactor');
  });

  test('library filters narrow to unlocked / locked buildings', async ({ page }) => {
    // Unlock order 3 (Water Reclaimer) so both buckets are non-empty.
    await page.locator('[data-testid="checklist-list"] li').filter({ hasText: 'Water Reclaimer' }).click();

    const lockedTab = page.locator('.planner-filter-btn[data-filter="locked"]');
    await lockedTab.click();
    await expect(page.locator('[data-testid="library-grid"] .planner-card:visible')).toHaveCount(9);

    const unlockedTab = page.locator('.planner-filter-btn[data-filter="unlocked"]');
    await unlockedTab.click();
    await expect(page.locator('[data-testid="library-grid"] .planner-card:visible')).toHaveCount(3);
  });

  test('closes back to home', async ({ page }) => {
    await page.locator('[data-testid="planner-close"]').click();
    await expect(page.locator('[data-testid="planner-panel"]')).toBeHidden();
    await expect(page.locator('[data-testid="home-status"]')).toBeVisible();
  });

  test('has no serious accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(serious).toEqual([]);
  });
});
