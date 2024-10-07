import * as v from 'valibot';

export const passwordSchema = (defaultError = 'Password is required', defaultFieldLabel = 'Password') =>
	v.pipe(
		v.string(defaultError),
		v.check((value) => !/\s/g.test(value), 'Spaces in the password are not allowed'),
		v.trim(),
		v.minLength(8, `${defaultFieldLabel} must be at least 8 characters`),
		v.regex(/[a-z]/, `${defaultFieldLabel} must contain a lowercase letter`),
		v.regex(/[A-Z]/, `${defaultFieldLabel} must contain a uppercase letter`),
		v.regex(/[0-9]/, `${defaultFieldLabel} must contain a number`)
	);
