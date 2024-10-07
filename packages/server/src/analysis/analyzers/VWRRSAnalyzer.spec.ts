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

		const refFileBug = readFileSync(
			`${process.cwd()}/test/mock-data/stooq/daily/spy.20240607.txt`
		);

		const refParseRes = parseStooqCSVcontent(refFileBug.toString().trim(), {
			limitCount: 50
		});

		refCandles = refParseRes?.tickers['SPY']?.candles ?? [];

		// const analyzer = new ATRAnalyzer({ period: 14 });
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
		const trendValues = processedCandles.map(
			(candle) => candle.indicators.get('vwrrs_trend') ?? null
		);

		const lastFiveValues = values.slice(values.length - 5);
		const lastFiveTrendValues = trendValues.slice(values.length - 5);

		assert.deepEqual(lastFiveValues, [3.31, 2.74, 2.02, 1.08, 2.25]);
		assert.deepEqual(lastFiveTrendValues, [1, -1, -1, -1, 1]);
	});
});
