import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, it } from 'node:test';
import { Candle } from 'src/entities/Candle.model';
import { parseStooqCSVcontent } from 'src/util/stooq';
import { ATRAnalyzer } from './ATRAnalyzer';

describe('Analyzer - ATR', () => {
	let initialCandles: Candle[] = [];
	let processedCandles: Candle[] = [];

	before(() => {
		const fileBuf = readFileSync(
			`${process.cwd()}/test/mock-data/stooq/daily/aapl.20240607.txt`
		);

		const parseRes = parseStooqCSVcontent(fileBuf.toString().trim(), {
			limitCount: 50
		});

		initialCandles = parseRes?.tickers['AAPL']?.candles ?? [];

		const analyzer = new ATRAnalyzer({ period: 14 });

		processedCandles = analyzer.analyze(initialCandles);
	});

	it('should have the correct array length', () => {
		assert.equal(initialCandles.length, processedCandles.length);
		assert.equal(processedCandles.length, 50);
	});

	it('should generate correct values', () => {
		const values = processedCandles.map((candle) => candle.indicators.get('atr') ?? null);

		const lastFiveValues = values.slice(values.length - 5);

		assert.deepEqual(lastFiveValues, [3.1, 3.04, 3.01, 2.96, 2.95]);
	});
});
