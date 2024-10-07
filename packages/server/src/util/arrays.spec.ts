import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { arrayFillToMinLength } from './arrays';

describe('Array Utilities', () => {
	it('should fill to min length correctly', () => {
		const targetLength = 5;
		const srcArr = [1, 2, 3];
		const paddedArr = arrayFillToMinLength(srcArr, targetLength);

		assert.equal(paddedArr.length, targetLength);
		assert.deepEqual(paddedArr, [null, null, 1, 2, 3]);
	});

	it('should fill to min length correctly with custom fill', () => {
		const targetLength = 5;
		const srcArr = [1, 2, 3];
		const paddedArr = arrayFillToMinLength(srcArr, targetLength, { fillValue: 0 });

		assert.equal(paddedArr.length, targetLength);
		assert.deepEqual(paddedArr, [0, 0, 1, 2, 3]);
	});

	it('should fill to min length correctly at the end of the array', () => {
		const targetLength = 5;
		const srcArr = [1, 2, 3];
		const paddedArr = arrayFillToMinLength(srcArr, targetLength, { fillAtBeginning: false });

		assert.equal(paddedArr.length, targetLength);
		assert.deepEqual(paddedArr, [1, 2, 3, null, null]);
	});

	it('should fill to min length correctly at the end of the array with custom fill', () => {
		const targetLength = 5;
		const srcArr = [1, 2, 3];
		const paddedArr = arrayFillToMinLength(srcArr, targetLength, {
			fillAtBeginning: false,
			fillValue: 0
		});

		assert.equal(paddedArr.length, targetLength);
		assert.deepEqual(paddedArr, [1, 2, 3, 0, 0]);
	});
});
