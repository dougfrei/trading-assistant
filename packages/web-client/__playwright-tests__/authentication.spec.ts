import { expect, test } from './test';

// test.beforeEach(async ({ page }) => {
// 	await page.goto('/');
// });

test('can login', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('textbox', { name: /email/i }).fill('test@test.com');
	await page.getByRole('textbox', { name: /password/i }).fill('testing');

	await page.getByRole('button', { name: /login/i }).click();

	await expect(page).toHaveTitle(/trading assistant/i);
});
