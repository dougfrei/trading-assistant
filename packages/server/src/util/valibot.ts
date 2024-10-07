import * as v from 'valibot';

export const valibotSchemas = {
	nonEmptyString: (message = '') => v.pipe(v.string(), v.trim(), v.minLength(1, message)),
	validNumber: v.pipe(v.number(), v.finite())
};
