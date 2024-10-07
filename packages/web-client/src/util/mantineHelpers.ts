/**
 * Check if a provided value is a number type. If it is not a number, return the
 * default value specified. This utility function is meant to be used with Mantine
 * number input fields where the value coming from the field can be null in certain
 * cases.
 *
 * @param value The input value to process as a number
 * @param defaultValue The default value to use in case the input value is not a number
 * @returns The input value or the default value if the input value is not a number
 */
export function getNumberInputValue(value: unknown, defaultValue = 0): number {
	return typeof value === 'number' ? value : defaultValue;
}
