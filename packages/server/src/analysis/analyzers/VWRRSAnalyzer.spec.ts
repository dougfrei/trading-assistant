import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, it } from 'node:test';
import { Candle } from 'src/entities/Candle.model';
import { parseStooqCSVcontent } from 'src/util/stooq';
import { VWRRSAnalyzer } from './VWRRSAnalyzer';

describe('Analyzer - VWRRS', () => {
	let srcCandles: Candle[] = [];
	let refCandles: Candle[] = [];
	let processedCandles: Candle[] = [];

	before(() => {
		const srcFileBuf = readFileSync(
			`${process.cwd()}/test/mock-data/stooq/daily/aapl.20240607.txt`
		);

		const srcParseRes = parseStooqCSVcontent(srcFileBuf.toString().trim(), {
			limitCount: 50
		});

		srcCandles = srcParseRes?.tickers['AAPL']?.candles ?? [];

		const refFileBuf = readFileSync(
			`${process.cwd()}/test/mock-data/stooq/daily/spy.20240607.txt`
		);

		const refParseRes = parseStooqCSVcontent(refFileBuf.toString().trim(), {
			limitCount: 50
		});

		refCandles = refParseRes?.tickers['SPY']?.candles ?? [];

		const analyzer = new VWRRSAnalyzer({
			refCandles,
			rollingPeriod: 21,
			rollingPeriodVolShort: 21,
			rollingPeriodVolLong: 5
		});

		processedCandles = analyzer.analyze(srcCandles);
	});

	it('should have the correct array length', () => {
		assert.equal(srcCandles.length, processedCandles.length);
		assert.equal(processedCandles.length, 50);
	});

	it('should generate correct values', () => {
		const values = processedCandles.map((candle) => candle.indicators.get('vwrrs') ?? null);

		const lastFiveValues = values.slice(values.length - 5);

		assert.deepEqual(lastFiveValues, [3.31, 2.74, 2.02, 1.08, 2.25]);
	});

	it('should generate correct trend values', () => {
		const trendValues = processedCandles.map(
			(candle) => candle.indicators.get('vwrrs_trend') ?? null
		);

		const lastFiveTrendValues = trendValues.slice(trendValues.length - 5);

		assert.deepEqual(lastFiveTrendValues, [1, -1, -1, -1, 1]);
	});

	it('should generate correct delta divergence values', () => {
		const deltaDivergenceValues = processedCandles.map(
			(candle) => candle.indicators.get('vwrrs_dd') ?? null
		);

		const lastFiveDeltaDivergenceValues = deltaDivergenceValues.slice(
			deltaDivergenceValues.length - 5
		);

		assert.deepEqual(lastFiveDeltaDivergenceValues, [-0.62, -0.27, 0, 0.17, 0.36]);
	});
});
