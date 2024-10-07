import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getNYDateObject, getNYMarketOpenDateObject, getTripleWitchingDates } from './date';

describe('Date Utilities', () => {
	it('should calculate triple witching dates correctly', () => {
		assert.deepEqual(getTripleWitchingDates(2023, 2023), [
			'2023-03-17',
			'2023-06-16',
			'2023-09-15',
			'2023-12-15'
		]);

		assert.deepEqual(getTripleWitchingDates(2024, 2024), [
			'2024-03-15',
			'2024-06-21',
			'2024-09-20',
			'2024-12-20'
		]);

		assert.deepEqual(getTripleWitchingDates(2019, 2024), [
			'2019-03-15',
			'2019-06-21',
			'2019-09-20',
			'2019-12-20',
			'2020-03-20',
			'2020-06-19',
			'2020-09-18',
			'2020-12-18',
			'2021-03-19',
			'2021-06-18',
			'2021-09-17',
			'2021-12-17',
			'2022-03-18',
			'2022-06-17',
			'2022-09-16',
			'2022-12-16',
			'2023-03-17',
			'2023-06-16',
			'2023-09-15',
			'2023-12-15',
			'2024-03-15',
			'2024-06-21',
			'2024-09-20',
			'2024-12-20'
		]);
	});

	it('should create a date object using NY time correctly', () => {
		const nyDate = getNYDateObject('2024-08-15T09:30:00');

		assert.equal(nyDate.toISOString(), '2024-08-15T13:30:00.000Z');

		const nyMarketOpenDate = getNYMarketOpenDateObject('2024-08-15');

		assert.equal(nyMarketOpenDate.toISOString(), '2024-08-15T13:30:00.000Z');
	});

	it('should throw when given an invalid date string', () => {
		assert.throws(() => {
			getNYDateObject('invalid date');
		}, Error);

		assert.throws(() => {
			getNYMarketOpenDateObject('invalid date');
		}, Error);
	});
});
