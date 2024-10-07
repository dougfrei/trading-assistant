/**
 * Rudimentary string value capitalizer that converts the input string to lowercase
 * and capitalizes the first letter.
 *
 * @param value String value to capitalize
 * @returns The capitalized string value
 */
export function capitalizeString(value: string) {
	return value.charAt(0).toUpperCase() + value.toLowerCase().slice(1);
}
