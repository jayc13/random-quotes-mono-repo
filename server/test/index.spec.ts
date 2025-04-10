import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('request for /categories', () => {
	it('GET /categories responds with a list of categories', async () => {
		const request = new Request('http://example.com/categories');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		// Add assertions for the response body if needed
	});

	it('POST /categories creates a new category', async () => {
		const request = new Request('http://example.com/categories', {
			method: 'POST',
			body: JSON.stringify({ name: 'New Category' }),
			headers: { 'Content-Type': 'application/json' },
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(201);
		// Add assertions for the response body if needed
	});
});
