export const localStorageKeys = {
	riskCalculatorStocksAccountSize: 'riskCalculator_AccountSize'
};

/**
 * Retrieve a value from local storage parsed as a float with an optional default
 * value that is used if the key doesn't exist
 *
 * @param key The local storage key to retrieve
 * @param defaultValue The default value used if the key doesn't exist in local storage
 * @returns The value saved in local storage or the default value if it doesn't exist
 */
export function localStorageGetFloatValue(key: string, defaultValue = 0): number {
	const value = localStorage.getItem(key);

	return value === null ? defaultValue : parseFloat(value);
}

/**
 * Set a floating point value in local storage with an option to restrict the
 * precision of the saved value
 *
 * @param key The local storage key to set
 * @param newValue The value to set
 * @param fixedDigits Optionally restrict the floating point precission
 */
export function localStorageSetFloatValue(key: string, newValue: number, fixedDigits = -1) {
	localStorage.setItem(
		key,
		fixedDigits > -1 ? newValue.toFixed(fixedDigits) : newValue.toString()
	);
}
