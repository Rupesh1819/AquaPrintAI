import { test, expect } from '@playwright/test';

const ROUTES = [
  '/', '/login', '/register', '/dashboard', '/scanner', '/search', 
  '/compare', '/assistant', '/profile', '/settings', '/tracking', 
  '/impact', '/challenges', '/leaderboard', '/admin/dashboard', 
  '/admin/users', '/admin/products', '/admin/settings', 
  '/admin/analytics', '/admin/audit'
];

const VIEWPORTS = [
  { width: 320, height: 568 }, 
  { width: 375, height: 667 }, 
  { width: 390, height: 844 }, 
  { width: 768, height: 1024 }, 
  { width: 1024, height: 768 }, 
  { width: 1440, height: 900 }
];

const BASE_URL = 'http://localhost:3000'; // Assuming dev server or prod server on 3000

test.describe('Route Rendering and Screenshot Verification', () => {
  for (const route of ROUTES) {
    test(`Verify ${route} across viewports`, async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('Failed to load resource: the server responded with a status of 401') && !msg.text().includes('403')) {
          errors.push(`Console error: ${msg.text()}`);
        }
        if (msg.text().includes('Hydration')) {
          errors.push(`Hydration warning: ${msg.text()}`);
        }
      });
      page.on('pageerror', err => errors.push(`Page error: ${err.message}`));
      
      for (const vp of VIEWPORTS) {
        await page.setViewportSize(vp);
        const res = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
        
        // 401 / 403 are acceptable since we are not logged in and hitting protected routes
        expect(res?.status()).not.toBe(500);
        expect(res?.status()).not.toBe(404);
        
        const routeName = route === '/' ? 'home' : route.replace(/\//g, '_');
        await page.screenshot({ path: `../qa/screenshots/${routeName}_${vp.width}.png`, fullPage: true });
        
        const brokenImages = await page.evaluate(() => {
          return Array.from(document.images).filter(img => !img.complete || (img.naturalWidth === 0 && img.src !== "")).length;
        });
        expect(brokenImages).toBe(0);
      }
      expect(errors).toEqual([]);
    });
  }
});

test.describe('End to End User Journeys', () => {
  test('Guest flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).not.toHaveTitle(/Error/);
    await page.goto(`${BASE_URL}/scanner`);
    await page.goto(`${BASE_URL}/compare`);
  });
});

test.describe('Offline Verification', () => {
  test('Dashboard loads offline', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
    await context.setOffline(false);
  });
});
