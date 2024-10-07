/**
 * Sanitizes the input string so that it will be lowercase, with all
 * non-alphanumeric characters removed, and spaces replaced with a dash ("-")
 *
 * @param value The input string
 * @returns Sanitized lowercase string with all non-alphanumeric characters removed and spaces replaced with a dash ("-")
 */
export function sanitizeStringValue(value: string): string {
	const valueParts = value.toLowerCase().split(/[^0-9a-z]/gi);

	return valueParts
		.reduce<string[]>((acum, part) => {
			if (part.trim()) {
				acum.push(part.trim());
			}

			return acum;
		}, [])
		.join('-');
}
