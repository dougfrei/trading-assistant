import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decodeOptionName, encodeOptionName } from './option-naming';

describe('Option Name Parsing', () => {
	it('should decode option name', () => {
		assert.deepEqual(decodeOptionName('SPY240627C00555000'), {
			tickerSymbol: 'SPY',
			expirationDate: '2024-06-27',
			type: 'CALL',
			strike: 555
		});
	});

	it('should throw when decoding invalid option name', () => {
		assert.throws(() => decodeOptionName('TOOLONG240627C00123000'));
	});

	it('should encode option name', () => {
		assert.equal(
			encodeOptionName({
				tickerSymbol: 'SPY',
				expirationDate: '2024-06-27',
				type: 'CALL',
				strike: 555
			}),
			'SPY240627C00555000'
		);
	});

	it('should throw when encoding a ticker symbol longer than 6 characters', () => {
		assert.throws(() =>
			encodeOptionName({
				tickerSymbol: 'SPYSPYA',
				expirationDate: '2024-06-27',
				type: 'CALL',
				strike: 555
			})
		);
	});

	it('should throw when encoding an invalid expiration date', () => {
		assert.throws(() =>
			encodeOptionName({
				tickerSymbol: 'SPY',
				expirationDate: '2024-13-27',
				type: 'CALL',
				strike: 555
			})
		);

		assert.throws(() =>
			encodeOptionName({
				tickerSymbol: 'SPY',
				expirationDate: 'invalid',
				type: 'CALL',
				strike: 555
			})
		);
	});
});
