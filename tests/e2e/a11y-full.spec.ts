import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectNoA11yViolations(page: Page) {
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
}

async function openDialogReliably(page: Page) {
	const openDialogButton = page.getByRole('button', { name: 'Open dialog' });
	const dialogHeading = page.getByRole('heading', { name: 'Hello' });

	for (let attempt = 0; attempt < 3; attempt += 1) {
		await openDialogButton.click();
		if (await dialogHeading.isVisible()) {
			return;
		}
		await page.waitForTimeout(150);
	}

	await expect(dialogHeading).toBeVisible();
}

test('home page baseline and dialog state have no detectable a11y issues @a11y @a11y-full', async ({
	page
}) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'design-starter' })).toBeVisible();
	await expectNoA11yViolations(page);

	await openDialogReliably(page);
	await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();
	await expectNoA11yViolations(page);
});

test('notes page has no detectable a11y issues for unauthenticated users @a11y @a11y-full', async ({
	page
}) => {
	await page.goto('/notes');
	await expect(page.getByRole('heading', { name: 'Notes' })).toBeVisible();
	await expectNoA11yViolations(page);
});

test('login page has no detectable a11y issues in password and magic-link modes @a11y @a11y-full', async ({
	page
}) => {
	await page.goto('/login');
	await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
	await expectNoA11yViolations(page);

	await page.getByRole('button', { name: 'Use magic link instead' }).click();
	await expect(page.getByRole('button', { name: 'Send magic link' })).toBeVisible();
	await expectNoA11yViolations(page);
});

test('signup page has no detectable a11y issues in password and magic-link modes @a11y @a11y-full', async ({
	page
}) => {
	await page.goto('/signup');
	await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
	await expectNoA11yViolations(page);

	await page.getByRole('button', { name: 'Use magic link instead' }).click();
	await expect(page.getByRole('button', { name: 'Send magic link' })).toBeVisible();
	await expectNoA11yViolations(page);
});
