import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isScreenerQueryLogicRoot, isScreenerQueryValueComparison } from './screenerQuery';

describe('Screener query logic', () => {
	it('should pass query logic root validation', () => {
		assert.equal(
			isScreenerQueryLogicRoot({
				logic: 'and',
				conditions: [
					'string_value',
					{
						logic: 'or',
						conditions: ['lrsi_slow_uptrend_start', 'lrsi_slow_break_os_up']
					},
					{
						indicator: 'indicator_name',
						compare: '=',
						value: 123
					},
					{
						operator: '>',
						leftValue: 'lrsi_fast',
						rightValue: 0
					}
				]
			}),
			true
		);
	});

	it('should fail query logic root validation', () => {
		assert.equal(
			isScreenerQueryLogicRoot({
				logic: 'invalid',
				conditions: [123]
			}),
			false
		);
	});

	it('should pass query value comparison validation', () => {
		assert.equal(
			isScreenerQueryValueComparison({
				leftValue: 10,
				operator: '>=',
				rightValue: 8
			}),
			true
		);
	});

	it('should fail query value comparison validation', () => {
		assert.equal(
			isScreenerQueryValueComparison({
				leftValue: null,
				operator: 'invalid',
				rightValue: 8
			}),
			false
		);
	});
});
