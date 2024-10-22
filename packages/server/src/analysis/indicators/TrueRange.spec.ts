import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, it } from 'node:test';
import { Candle } from 'src/entities/Candle.model';
import { arrayFillToMinLength } from 'src/util/arrays';
import { parseStooqCSVcontent } from 'src/util/stooq';
import { TrueRange as TrueRange_TI } from 'technicalindicators';
import TrueRange from './TrueRange';

describe('Indicator - TrueRange', () => {
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
			TrueRange_TI.calculate({
				low: candles.map((candle) => candle.low),
				high: candles.map((candle) => candle.high),
				close: candles.map((candle) => candle.close)
			}),
			candles.length
		);

		const trueRange = new TrueRange();
		const trValues = candles.map((candle) =>
			trueRange.push({ low: candle.low, high: candle.high, close: candle.close })
		);

		assert.deepEqual(referenceValues, trValues);
	});
});
