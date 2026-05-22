import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('landing page has no detectable a11y issues @a11y', async ({ page }) => {
	await page.goto('/');
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
});
