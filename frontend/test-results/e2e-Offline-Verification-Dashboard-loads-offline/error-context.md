# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Offline Verification >> Dashboard loads offline
- Location: e2e.spec.ts:69:7

# Error details

```
Error: page.reload: net::ERR_INTERNET_DISCONNECTED
Call log:
  - waiting for navigation until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const ROUTES = [
  4  |   '/', '/login', '/register', '/dashboard', '/scanner', '/search', 
  5  |   '/compare', '/assistant', '/profile', '/settings', '/tracking', 
  6  |   '/impact', '/challenges', '/leaderboard', '/admin/dashboard', 
  7  |   '/admin/users', '/admin/products', '/admin/settings', 
  8  |   '/admin/analytics', '/admin/audit'
  9  | ];
  10 | 
  11 | const VIEWPORTS = [
  12 |   { width: 320, height: 568 }, 
  13 |   { width: 375, height: 667 }, 
  14 |   { width: 390, height: 844 }, 
  15 |   { width: 768, height: 1024 }, 
  16 |   { width: 1024, height: 768 }, 
  17 |   { width: 1440, height: 900 }
  18 | ];
  19 | 
  20 | const BASE_URL = 'http://localhost:3000'; // Assuming dev server or prod server on 3000
  21 | 
  22 | test.describe('Route Rendering and Screenshot Verification', () => {
  23 |   for (const route of ROUTES) {
  24 |     test(`Verify ${route} across viewports`, async ({ page }) => {
  25 |       const errors: string[] = [];
  26 |       
  27 |       page.on('console', msg => {
  28 |         if (msg.type() === 'error' && !msg.text().includes('Failed to load resource: the server responded with a status of 401') && !msg.text().includes('403')) {
  29 |           errors.push(`Console error: ${msg.text()}`);
  30 |         }
  31 |         if (msg.text().includes('Hydration')) {
  32 |           errors.push(`Hydration warning: ${msg.text()}`);
  33 |         }
  34 |       });
  35 |       page.on('pageerror', err => errors.push(`Page error: ${err.message}`));
  36 |       
  37 |       for (const vp of VIEWPORTS) {
  38 |         await page.setViewportSize(vp);
  39 |         const res = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  40 |         
  41 |         // 401 / 403 are acceptable since we are not logged in and hitting protected routes
  42 |         expect(res?.status()).not.toBe(500);
  43 |         expect(res?.status()).not.toBe(404);
  44 |         
  45 |         const routeName = route === '/' ? 'home' : route.replace(/\//g, '_');
  46 |         await page.screenshot({ path: `../qa/screenshots/${routeName}_${vp.width}.png`, fullPage: true });
  47 |         
  48 |         const brokenImages = await page.evaluate(() => {
  49 |           return Array.from(document.images).filter(img => !img.complete || (img.naturalWidth === 0 && img.src !== "")).length;
  50 |         });
  51 |         expect(brokenImages).toBe(0);
  52 |       }
  53 |       expect(errors).toEqual([]);
  54 |     });
  55 |   }
  56 | });
  57 | 
  58 | test.describe('End to End User Journeys', () => {
  59 |   test('Guest flow', async ({ page }) => {
  60 |     await page.goto(`${BASE_URL}/login`);
  61 |     await page.goto(`${BASE_URL}/dashboard`);
  62 |     await expect(page).not.toHaveTitle(/Error/);
  63 |     await page.goto(`${BASE_URL}/scanner`);
  64 |     await page.goto(`${BASE_URL}/compare`);
  65 |   });
  66 | });
  67 | 
  68 | test.describe('Offline Verification', () => {
  69 |   test('Dashboard loads offline', async ({ page, context }) => {
  70 |     await page.goto(`${BASE_URL}/dashboard`);
  71 |     await page.waitForLoadState('networkidle');
  72 |     await context.setOffline(true);
> 73 |     await page.reload();
     |                ^ Error: page.reload: net::ERR_INTERNET_DISCONNECTED
  74 |     await expect(page.locator('body')).toBeVisible();
  75 |     await context.setOffline(false);
  76 |   });
  77 | });
  78 | 
```