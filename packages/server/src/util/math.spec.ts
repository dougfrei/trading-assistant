import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyPercentageGain, percentChange } from 'src/util/math';

describe('Math Utilities', () => {
	it('should calculate percentage changes correctly', () => {
		assert.equal(percentChange(1, 1.5, 2), 50);
		assert.equal(percentChange(1, 0.5, 2), -50);
		assert.equal(percentChange(1.9125, 2.2926, 2), 19.87);
		assert.equal(percentChange(2.2926, 1.9125, 2), -16.58);
		assert.equal(percentChange(0, 1, 2), 0);
		assert.equal(percentChange(1, 0, 2), -100);
		assert.equal(percentChange(-10, -5, 2), 50);
		assert.equal(percentChange(-10, -8, 2), 20);
		assert.equal(percentChange(-10, -12, 2), -20);
		assert.equal(percentChange(-5, 5, 2), 200);
		assert.equal(percentChange(5, -5, 2), -200);
	});

	it('should apply percentage gains correctly', () => {
		assert.equal(applyPercentageGain(100, 0.5, 2), 100.5);
		assert.equal(applyPercentageGain(100, -0.5, 2), 99.5);
		assert.equal(applyPercentageGain(1.9125, 19.87, 2), 2.29);
		assert.equal(applyPercentageGain(2.2926, -16.58, 2), 1.91);
	});
});
