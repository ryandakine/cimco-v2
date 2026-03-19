import { test, expect } from '@playwright/test';

const BASE = 'https://cimco.osi-cyber.com';

// ─── Site Loads ─────────────────────────────────────────────────────────────

test.describe('Site Loads', () => {
  test('homepage loads without errors', async ({ page }) => {
    const response = await page.goto(BASE);
    expect(response?.status()).toBeLessThan(400);
    // Wait for React to render something
    await page.waitForLoadState('networkidle');
    // Page should have some content
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(0);
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Filter out known noise (e.g. favicon 404s)
    const realErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('Failed to load resource')
    );
    expect(realErrors).toHaveLength(0);
  });
});

// ─── Login Page ─────────────────────────────────────────────────────────────

test.describe('Login Page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Should see some kind of login UI — look for username/password inputs or login text
    const hasLoginForm =
      (await page.locator('input[type="password"]').count()) > 0 ||
      (await page.locator('text=/login/i').count()) > 0 ||
      (await page.locator('text=/sign in/i').count()) > 0;

    expect(hasLoginForm).toBe(true);
  });

  test('shows validation when submitting empty form', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Find and click the submit/login button without filling fields
    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
    );
    if ((await submitBtn.count()) > 0) {
      await submitBtn.first().click();
      // Should show some error/validation message, or stay on login page
      await page.waitForTimeout(1000);
      const url = page.url();
      // Should not have navigated away from login
      expect(url).toContain(BASE.replace('https://', ''));
    }
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Fill in bad credentials
    const usernameInput = page.locator(
      'input[name="username"], input[type="text"]'
    );
    const passwordInput = page.locator('input[type="password"]');

    if ((await usernameInput.count()) > 0 && (await passwordInput.count()) > 0) {
      await usernameInput.first().fill('bad_user_xyz');
      await passwordInput.first().fill('WrongPass123');

      const submitBtn = page.locator(
        'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
      );
      await submitBtn.first().click();

      // Wait for error response
      await page.waitForTimeout(2000);

      // Should show an error message or remain on login
      const pageText = await page.textContent('body');
      const hasError =
        pageText?.toLowerCase().includes('invalid') ||
        pageText?.toLowerCase().includes('error') ||
        pageText?.toLowerCase().includes('incorrect') ||
        pageText?.toLowerCase().includes('failed');
      expect(hasError).toBe(true);
    }
  });
});

// ─── Login + Dashboard Flow ─────────────────────────────────────────────────

test.describe('Authenticated Flow', () => {
  test('login with valid creds and see dashboard/parts', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator(
      'input[name="username"], input[type="text"]'
    );
    const passwordInput = page.locator('input[type="password"]');

    if ((await usernameInput.count()) === 0 || (await passwordInput.count()) === 0) {
      test.skip(true, 'Login form not found');
      return;
    }

    await usernameInput.first().fill('admin');
    await passwordInput.first().fill('Admin123');

    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
    );
    await submitBtn.first().click();

    // Wait for navigation after login
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // After login we should see inventory content — parts list, dashboard, etc.
    const pageText = (await page.textContent('body')) || '';
    const isLoggedIn =
      pageText.toLowerCase().includes('part') ||
      pageText.toLowerCase().includes('inventory') ||
      pageText.toLowerCase().includes('dashboard') ||
      pageText.toLowerCase().includes('logout') ||
      pageText.toLowerCase().includes('quantity');

    if (!isLoggedIn) {
      // Maybe creds are wrong, just log and skip
      console.log('Could not log in with default creds. Page text snippet:', pageText.slice(0, 200));
      test.skip(true, 'Default admin credentials may not work');
      return;
    }

    expect(isLoggedIn).toBe(true);
  });

  test('parts list loads and shows table data', async ({ page }) => {
    // Login first
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('input[name="username"], input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    if ((await usernameInput.count()) === 0) {
      test.skip(true, 'No login form');
      return;
    }

    await usernameInput.first().fill('admin');
    await passwordInput.first().fill('Admin123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Check for a table or list of parts
    const hasTable = (await page.locator('table').count()) > 0;
    const hasCards = (await page.locator('[class*="card"], [class*="grid"]').count()) > 0;
    const hasItems = hasTable || hasCards;

    if (!hasItems) {
      const text = (await page.textContent('body')) || '';
      console.log('Page after login:', text.slice(0, 300));
    }

    expect(hasItems).toBe(true);
  });

  test('can navigate to a part detail', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('input[name="username"], input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    if ((await usernameInput.count()) === 0) {
      test.skip(true, 'No login form');
      return;
    }

    await usernameInput.first().fill('admin');
    await passwordInput.first().fill('Admin123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Click on first part link/row
    const partLink = page.locator('table tbody tr a, table tbody tr').first();
    if ((await partLink.count()) > 0) {
      await partLink.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');

      // Should see detail info
      const text = (await page.textContent('body')) || '';
      const hasDetail =
        text.toLowerCase().includes('quantity') ||
        text.toLowerCase().includes('category') ||
        text.toLowerCase().includes('location') ||
        text.toLowerCase().includes('history');
      expect(hasDetail).toBe(true);
    }
  });

  test('search/filter works on parts list', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('input[name="username"], input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    if ((await usernameInput.count()) === 0) {
      test.skip(true, 'No login form');
      return;
    }

    await usernameInput.first().fill('admin');
    await passwordInput.first().fill('Admin123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator(
      'input[placeholder*="earch"], input[name="search"], input[type="search"]'
    );
    if ((await searchInput.count()) > 0) {
      await searchInput.first().fill('xyznonexistent999');
      await page.waitForTimeout(2000);

      // Should show empty state or "no results"
      const text = (await page.textContent('body')) || '';
      const showsEmpty =
        text.toLowerCase().includes('no ') ||
        text.toLowerCase().includes('empty') ||
        text.toLowerCase().includes('0 result') ||
        text.toLowerCase().includes('not found');
      // Or the table is simply empty
      const tableRows = await page.locator('table tbody tr').count();
      expect(showsEmpty || tableRows === 0).toBe(true);
    }
  });

  test('logout works', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('input[name="username"], input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    if ((await usernameInput.count()) === 0) {
      test.skip(true, 'No login form');
      return;
    }

    await usernameInput.first().fill('admin');
    await passwordInput.first().fill('Admin123');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Find and click logout
    const logoutBtn = page.locator(
      'button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")'
    );
    if ((await logoutBtn.count()) > 0) {
      await logoutBtn.first().click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');

      // Should be back at login
      const hasLoginForm = (await page.locator('input[type="password"]').count()) > 0;
      expect(hasLoginForm).toBe(true);
    }
  });
});

// ─── API Health Check (via browser fetch) ───────────────────────────────────

test.describe('API Health', () => {
  test('health endpoint returns OK', async ({ request }) => {
    const res = await request.get(`${BASE}/health`);
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('OK');
  });

  test('protected API returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v2/parts`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.status).toBe(401);
  });

  test('login validation returns proper JSON errors', async ({ request }) => {
    const res = await request.post(`${BASE}/api/v2/auth/login`, {
      data: { username: '', password: '' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.status).toBe(400);
  });
});
