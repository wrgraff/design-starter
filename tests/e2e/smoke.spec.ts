import { expect, test } from '@playwright/test';

test('landing page loads and opens smoke-test dialog', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { name: 'design-starter' })).toBeVisible();

	const openDialogButton = page.getByRole('button', { name: 'Open dialog' });
	const dialogHeading = page.getByRole('heading', { name: 'Hello' });

	for (let attempt = 0; attempt < 3; attempt += 1) {
		await openDialogButton.click();
		if (await dialogHeading.isVisible()) {
			break;
		}
		await page.waitForTimeout(150);
	}

	await expect(dialogHeading).toBeVisible();
	await expect(page.getByText('This is a smoke-test dialog.')).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(dialogHeading).not.toBeVisible();
});
