import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, it } from 'node:test';
import { Candle } from 'src/entities/Candle.model';
import { arrayFillToMinLength } from 'src/util/arrays';
import { parseStooqCSVcontent } from 'src/util/stooq';
import { VWAP as VWAP_TI } from 'technicalindicators';
import VWAP from './VWAP';

describe('Indicator - SMA', () => {
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

	it('should match HLC reference values from technicalindicators package', () => {
		const referenceValues = arrayFillToMinLength(
			VWAP_TI.calculate({
				high: candles.map((candle) => candle.high),
				low: candles.map((candle) => candle.low),
				close: candles.map((candle) => candle.close),
				volume: candles.map((candle) => candle.volume)
			}),
			candles.length
		);

		const vwap = new VWAP();
		const vwapValues = candles.map((candle) =>
			vwap.push({
				high: candle.high,
				low: candle.low,
				close: candle.close,
				volume: candle.volume
			})
		);

		assert.deepEqual(referenceValues, vwapValues);
	});
});
