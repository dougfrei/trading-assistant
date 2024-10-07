import * as v from 'valibot';

export function getFMPErrorMessage(
	obj: object,
	defaultMessage = 'An error occurred during the FMP request'
) {
	const validatedObj = v.safeParse(
		v.object({
			'Error Message': v.string()
		}),
		obj
	);

	return validatedObj.success ? validatedObj.output['Error Message'] : defaultMessage;
}
