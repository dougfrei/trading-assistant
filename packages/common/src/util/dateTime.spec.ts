import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { timestampToMilliseconds, timestampToSeconds } from './dateTime';

describe('Timestamp Parsing', () => {
	it('should convert timestamp to milliseconds when passed seconds', () => {
		assert.equal(timestampToMilliseconds(1658268430), 1658268430 * 1000);
	});

	it('should convert timestamp to milliseconds when passed milliseconds', () => {
		assert.equal(timestampToMilliseconds(1658269460488), 1658269460488);
	});

	it('should convert timestamp to seconds when passed milliseconds', () => {
		assert.equal(timestampToSeconds(1658269460488), 1658269460);
	});

	it('should convert timestamp to seconds when passed seconds', () => {
		assert.equal(timestampToSeconds(1658269460), 1658269460);
	});
});
