import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, it } from 'node:test';
import { Candle } from 'src/entities/Candle.model';
import { arrayFillToMinLength } from 'src/util/arrays';
import { isCandleIndicatorNumericValue } from 'src/util/candle';
import { twoDecimals } from 'src/util/math';
import { parseStooqCSVcontent } from 'src/util/stooq';
import { ATR as ATR_TI } from 'technicalindicators';
import ATR from './ATR';

describe('Indicator - ATR', () => {
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
			ATR_TI.calculate({
				period,
				high: candles.map((candle) => candle.high),
				low: candles.map((candle) => candle.low),
				close: candles.map((candle) => candle.close)
			}),
			candles.length
		);

		const atr = new ATR(period);
		const atrValues = candles.map((candle) =>
			atr.push({ high: candle.high, low: candle.low, close: candle.close })
		);

		assert.deepEqual(referenceValues, atrValues);
	});

	it('should format response values', () => {
		const atr = new ATR(period);

		atr.applyFormatter((value) =>
			isCandleIndicatorNumericValue(value) ? twoDecimals(value) : value
		);

		const atrFormattedValues = candles.map((candle) =>
			atr.push({ high: candle.high, low: candle.low, close: candle.close })
		);

		assert.deepEqual(
			[null, null, null, null, null, 2.79, 2.69, 2.66, 2.59, 2.63],
			atrFormattedValues
		);
	});
});
