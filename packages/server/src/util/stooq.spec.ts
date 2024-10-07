import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	getStooqCSVrecordDateObject,
	parseStooqDateString,
	parseStooqTimeString
} from 'src/util/stooq';

describe('Stooq Data Parsing', () => {
	it('should correctly parse a date string from stooq CSV data', () => {
		assert.equal(parseStooqDateString('20220814'), '2022-08-14');
		assert.equal(parseStooqDateString('2022-08-14'), '2022-08-14');
		assert.equal(parseStooqDateString('2022081'), '');
	});

	it('should correctly parse a time string from stooq CSV data', () => {
		assert.equal(parseStooqTimeString('000000'), '00:00:00');
		assert.equal(parseStooqTimeString('093000'), '09:30:00');
		assert.equal(parseStooqTimeString('09300'), '');
	});

	it('should correctly create a date object from stooq date and time strings', () => {
		const dateObj1 = getStooqCSVrecordDateObject('20220808', '000000', { isDay: true });
		const dateObj2 = getStooqCSVrecordDateObject('20220814', '161800');

		assert.equal(dateObj1?.toISOString(), '2022-08-08T13:30:00.000Z');
		assert.equal(dateObj2?.toISOString(), '2022-08-14T16:18:00.000Z');
	});
});
