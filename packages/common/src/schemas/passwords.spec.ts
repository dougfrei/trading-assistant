import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as v from 'valibot';
import { passwordSchema } from './passwords';

describe('Password schema validation', () => {
	it('should fail when including spaces', () => {
		assert.equal(v.safeParse(passwordSchema(), ' value with spaces').success, false);
		assert.equal(v.safeParse(passwordSchema(), 'value test').success, false);
	});

	it('should fail when empty', () => {
		assert.equal(v.safeParse(passwordSchema(), ' ').success, false);
		assert.equal(v.safeParse(passwordSchema(), '').success, false);
	});

	it('should fail when less than 8 characters', () => {
		assert.equal(v.safeParse(passwordSchema(), ' 1234567').success, false);
		assert.equal(v.safeParse(passwordSchema(), '1234567').success, false);
	});

	it('should fail with no lowercase letter', () => {
		assert.equal(v.safeParse(passwordSchema(), 'ALL_UPPERCASE').success, false);
	});

	it('should fail with no uppercase letter', () => {
		assert.equal(v.safeParse(passwordSchema(), 'all_lowercase').success, false);
	});

	it('should fail with no numbers', () => {
		assert.equal(v.safeParse(passwordSchema(), 'No_Numbers').success, false);
	});

	it('should pass validation', () => {
		assert.equal(v.safeParse(passwordSchema(), 'Val1dPa33w0rD').success, true);
	});
});
