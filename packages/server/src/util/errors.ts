/**
 * Check if the input value is an Error object and return a new Error object with
 * the optional provided error message if necessary
 *
 * @param errObj The potential error object
 * @param defaultErrorMessage An optional error message to use if the input value is not an Error object
 * @returns An Error object
 */
export function getErrorObject(errObj: unknown, defaultErrorMessage = 'An error has occurred') {
	if (errObj instanceof Error) {
		return errObj;
	}

	return new Error(defaultErrorMessage);
}
