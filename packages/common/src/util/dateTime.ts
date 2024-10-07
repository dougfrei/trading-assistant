import { format } from 'date-fns';

/**
 * Convert a timestamp either in seconds or milliseconds into a timestamp in seconds
 *
 * @param timestamp The timestamp to convert
 * @returns The input timestamp represented in seconds
 */
export function timestampToSeconds(timestamp: number): number {
	if (timestamp.toString().length <= 10) {
		return timestamp;
	}

	return Math.round(timestamp / 1000);
}

/**
 * Convert a timestamp either in seconds or milliseconds into a timestamp in milliseconds
 *
 * @param timestamp The timestamp to convert
 * @returns The input timestamp represented in milliseconds
 */
export function timestampToMilliseconds(timestamp: number): number {
	if (timestamp.toString().length > 10) {
		return timestamp;
	}

	return timestamp * 1000;
}

/**
 * Return a "YYYY-MM-DD" string from the provided date object
 *
 * @param dateObj The input date object
 * @returns A string in "YYYY-MM-DD" format
 */
export function getYMDdateString(dateObj: Date): string {
	return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Test if a string matches a valid YYYY-MM-DD format
 *
 * @param dateStr The string to test
 * @returns Boolean indicating the the provided string value is valid
 */
export function isValidYMDdateString(dateStr: string) {
	const timestamp = Date.parse(`${dateStr}T00:00:00`);

	return !isNaN(timestamp);
}
