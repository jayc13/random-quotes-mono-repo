import { expect, Page } from '@playwright/test';
import { ADMIN_BASE_URL } from '../../utils/config';

type UserType = 'ADMIN' | 'REGULAR';

const CREDENTIALS = {
	ADMIN: {
		username: process.env.ADMIN_USER_EMAIL,
		password: process.env.ADMIN_USER_PASSWORD,
	},
	REGULAR: {
		username: process.env.REGULAR_USER_EMAIL,
		password: process.env.REGULAR_USER_PASSWORD,
	}
}

export const loginAs = async (page: Page, userType: UserType): Promise<string> => {
	const credentials = CREDENTIALS[userType];
	await page.goto(`${ADMIN_BASE_URL}/login`);

	const loginButton = page.getByTestId('login-button');
	await expect(loginButton).toBeVisible();
	await loginButton.click();

	const emailInput = page.getByLabel('Email');
	await expect(emailInput).toBeVisible();
	await emailInput.fill(credentials.username);
	const passwordInput = page.getByLabel('Password');
	await expect(passwordInput).toBeVisible();
	await passwordInput.fill(credentials.password);
	const submitButton = page.getByText('Continue', { exact: true });
	await expect(submitButton).toBeVisible();
	// Listen for the request to be sent
	const loginRequestWatcher = page.waitForRequest((request) => {
		return request.url().includes('/oauth/token') && request.method() === 'POST';
	});
	await submitButton.click();
	const loginRequest =  await loginRequestWatcher;
	await page.waitForURL(ADMIN_BASE_URL);
	let response = await loginRequest.response();
	if (!response) {
		throw new Error('Login request failed');
	}
	const responseBody = await response.json();
	return `Bearer ${responseBody.id_token}`;
}