import * as v from 'valibot';
import SimpleFetchResponseError from './SimpleFetchResponseError';
import SimpleFetchValidationError from './SimpleFetchValidationError';

interface ISimpleFetchParams {
	body?: unknown;
	fetchOpts?: RequestInit;
	validateSchema?: unknown;
	responseErrorText?: string;
	validationErrorText?: string;
}

async function simpleFetch<T = unknown>(
	uri: string,
	{
		body,
		fetchOpts,
		validateSchema,
		responseErrorText = 'A response error occurred',
		validationErrorText = 'Schema validation of response data failed'
	}: ISimpleFetchParams = {}
) {
	const fetchParams: RequestInit = {
		method: body ? 'POST' : 'GET',
		...(fetchOpts ?? {}),
		headers: {
			'content-type': 'application/json',
			...(fetchOpts?.headers ?? {})
		}
	};

	if (body) {
		fetchParams.body = JSON.stringify(body);
	}

	const response = await fetch(uri, fetchParams);

	if (!response.ok) {
		throw new SimpleFetchResponseError(responseErrorText, response);
	}

	const parsedResponse = await response.json();

	if (validateSchema) {
		const validateResult = v.safeParse(validateSchema as v.AnySchema, parsedResponse);

		if (!validateResult.success) {
			throw new SimpleFetchValidationError(
				validationErrorText,
				v.flatten<v.AnySchema>(validateResult.issues)
			);
		}

		return validateResult.output as T;
	}

	return parsedResponse as T;
}

export default simpleFetch;
