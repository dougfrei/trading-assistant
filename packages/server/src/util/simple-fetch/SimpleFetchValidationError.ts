import * as v from 'valibot';

class SimpleFetchValidationError extends Error {
	public validationErrors: v.FlatErrors<v.AnySchema>;

	constructor(message: string, validationErrors: v.FlatErrors<v.AnySchema>) {
		super(message);

		this.validationErrors = validationErrors;
	}
}

export default SimpleFetchValidationError;
