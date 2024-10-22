import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, describe, it } from 'node:test';
import { Candle } from 'src/entities/Candle.model';
import { parseStooqCSVcontent } from 'src/util/stooq';
import LRSI from './LRSI';

describe('Indicator - LRSI', () => {
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

	it('should generate the correct values', () => {
		const lrsi = new LRSI(0.7);
		const lrsiValues = candles.map((candle) => lrsi.push(candle.close));

		assert.deepEqual(
			[
				0.6803652968036529, 0.7376215265173194, 0.7448097464305261, 0.7333204006139126,
				0.7836560851653114, 0.8806399621975135, 1, 1, 1, 1
			],
			lrsiValues
		);
	});
});
