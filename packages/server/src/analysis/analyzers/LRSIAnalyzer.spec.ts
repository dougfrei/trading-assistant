import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, it } from 'node:test';
import { Candle } from 'src/entities/Candle.model';
import { parseStooqCSVcontent } from 'src/util/stooq';
import { LRSIAnalyzer } from './LRSIAnalyzer';

describe('Analyzer - LRSI', () => {
	let initialCandles: Candle[] = [];
	let processedCandles: Candle[] = [];

	before(() => {
		const fileBuf = readFileSync(`${process.cwd()}/test/mock-data/stooq/daily/aapl.us.txt`);

		const parseRes = parseStooqCSVcontent(fileBuf.toString().trim(), {
			limitCount: 50
		});

		initialCandles = parseRes?.tickers['AAPL']?.candles ?? [];

		const analyzer = new LRSIAnalyzer({
			fastPeriodGamma: 0.4,
			slowPeriodGamma: 0.7,
			overbought: 0.8,
			oversold: 0.2
		});

		processedCandles = analyzer.analyze(initialCandles);
	});

	it('should have the correct array length', () => {
		assert.equal(initialCandles.length, processedCandles.length);
		assert.equal(processedCandles.length, 50);
	});

	it('should generate correct values', () => {
		const values = processedCandles.map((candle) => ({
			fast: candle.indicators.get(LRSIAnalyzer.INDICATOR_KEY_FAST),
			slow: candle.indicators.get(LRSIAnalyzer.INDICATOR_KEY_SLOW),
			fastTrend: candle.indicators.get(LRSIAnalyzer.INDICATOR_KEY_FAST_TREND),
			slowTrend: candle.indicators.get(LRSIAnalyzer.INDICATOR_KEY_SLOW_TREND)
		}));

		const lastFiveValues = values.slice(values.length - 5);

		assert.deepEqual(lastFiveValues, [
			{ fast: 1, slow: 0.46, fastTrend: 0, slowTrend: 1 },
			{ fast: 1, slow: 0.56, fastTrend: 0, slowTrend: 1 },
			{ fast: 0.79, slow: 0.59, fastTrend: -1, slowTrend: 1 },
			{ fast: 0.94, slow: 0.78, fastTrend: 1, slowTrend: 1 },
			{ fast: 0.89, slow: 1, fastTrend: -1, slowTrend: 1 }
		]);
	});
});
