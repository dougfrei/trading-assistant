import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, it } from 'node:test';
import { Candle } from 'src/entities/Candle.model';
import { arrayFillToMinLength } from 'src/util/arrays';
import { parseStooqCSVcontent } from 'src/util/stooq';
import { SMA as SMA_TI } from 'technicalindicators';
import SMA from './SMA';

describe('Indicator - SMA', () => {
	const period = 5;
	let candles: Candle[] = [];

	before(() => {
		const fileBuf = readFileSync(
			`${process.cwd()}/test/mock-data/stooq/daily/aapl.20240607.txt`
		);

		const parsedFile = parseStooqCSVcontent(fileBuf.toString().trim(), {
			limitCount: 10
		});

		candles = parsedFile?.tickers['AAPL']?.candles ?? [];
	});

	it('should match reference values from technicalindicators package', () => {
		const referenceValues = arrayFillToMinLength(
			SMA_TI.calculate({
				period,
				values: candles.map((candle) => candle.close)
			}),
			candles.length
		);

		const sma = new SMA(period);
		const smaValues = candles.map((candle) => sma.push(candle.close));

		assert.deepEqual(referenceValues, smaValues);
	});
});
