/**
 * Remove duplicate values from an array
 *
 * @param srcArray The array to remove duplicate values from
 * @returns A copy of the input array with duplicate values removed
 */
export function arrayUnique<T>(srcArray: readonly T[]): T[] {
	return Array.from(new Set(srcArray));
}

interface TArrayFillToMinLengthOpts<T> {
	fillValue?: T;
	fillAtBeginning?: boolean;
	deepClone?: boolean;
}

/**
 * Return a new array that matches the specified length. Defaults to appending
 * null values to the beginning of the array.
 *
 * @param srcArray The input array
 * @param minLength The minimum length of the returned array
 * @param params Optional object with 'fillValue', 'fillAtBeginning', and 'deepClone' settings
 * @returns
 */
export function arrayFillToMinLength<T, F = null>(
	srcArray: T[],
	minLength: number,
	params: TArrayFillToMinLengthOpts<F> = {}
): (F | T | null)[] {
	const { fillValue = null, fillAtBeginning = true, deepClone = false } = params;

	if (srcArray.length >= minLength) {
		return srcArray;
	}

	return fillAtBeginning
		? [
				...Array<F | null>(minLength - srcArray.length).fill(fillValue),
				...(deepClone ? structuredClone(srcArray) : srcArray)
			]
		: [
				...(deepClone ? structuredClone(srcArray) : srcArray),
				...Array<F | null>(minLength - srcArray.length).fill(fillValue)
			];
}
