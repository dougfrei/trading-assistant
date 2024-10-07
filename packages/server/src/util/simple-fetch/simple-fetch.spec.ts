import { setupServer } from 'msw/node';
import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import simpleFetchHandlers from 'src/testing/msw-handlers/simple-fetch.handlers';
import * as v from 'valibot';
import simpleFetch from './';
import SimpleFetchResponseError from './SimpleFetchResponseError';
import SimpleFetchValidationError from './SimpleFetchValidationError';

describe('Simple Fetch', () => {
	before(() => {
		setupServer(...simpleFetchHandlers).listen();
	});

	it('should perform a GET request successfully', async () => {
		assert.doesNotReject(async () => {
			await simpleFetch('https://simple-fetch-mock.com/get');
		});
	});

	it('should perform a POST request successfully', async () => {
		assert.doesNotReject(async () => {
			await simpleFetch('https://simple-fetch-mock.com/post', {
				body: {
					value: 'this is test body content'
				}
			});
		});
	});

	it('should throw a response error', () => {
		assert.rejects(async () => {
			await simpleFetch('https://simple-fetch-mock.com/get/response-error');
		}, SimpleFetchResponseError);
	});

	it('should throw a response error due to a network failure', () => {
		assert.rejects(async () => {
			await simpleFetch('https://simple-fetch-mock.com/get/network-failure');
		}, Error);
	});

	it('should validate response successfully', () => {
		assert.doesNotReject(async () => {
			await simpleFetch('https://simple-fetch-mock.com/get', {
				validateSchema: v.array(
					v.object({
						name: v.string(),
						value: v.union([v.string(), v.number()])
					})
				)
			});
		});

		assert.doesNotReject(async () => {
			await simpleFetch('https://simple-fetch-mock.com/get/empty-array', {
				validateSchema: v.array(
					v.object({
						name: v.string(),
						value: v.union([v.string(), v.number()])
					})
				)
			});
		});
	});

	it('should fail response validation', () => {
		assert.rejects(async () => {
			await simpleFetch('https://simple-fetch-mock.com/get', {
				validateSchema: v.object({
					thisResponse: v.string(),
					willBeAnArray: v.number()
				})
			});
		}, SimpleFetchValidationError);
	});
});
