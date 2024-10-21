/**
 * Calculate the percentage change between two values
 *
 * @param origNum The original value
 * @param newNum The new value
 * @param fixedDecimals Optionally round the returned value to a fixed decimal count
 * @returns The percentage change between the two input values
 */
export function percentChange(origNum: number, newNum: number, fixedDecimals = -1): number {
	let change = ((newNum - origNum) / origNum) * (newNum >= 0 ? 100 : -100);

	if (!isFinite(change) || isNaN(change)) {
		return 0;
	}

	if ((origNum < 0 && newNum > 0) || (origNum > 0 && newNum < 0)) {
		change = change * -1;
	}

	return toFixedDecimals(change, fixedDecimals);
}

/**
 * Apply a percentage gain to a base value and return the result
 *
 * @param baseValue The base value
 * @param percentGain The percentage gain to apply to the base value
 * @param fixedDecimals Optionally round the returned value to a fixed decimal count
 * @returns The result of the base value with the percentage gain applied
 */
export function applyPercentageGain(
	baseValue: number,
	percentGain: number,
	fixedDecimals = -1
): number {
	const newTotal = baseValue + baseValue * (percentGain / 100);

	return toFixedDecimals(newTotal, fixedDecimals);
}

/**
 * Helper function to round a value to two decimal places since it is a common
 * task in this project
 *
 * @param value The value to round to two decimal places
 * @returns The input value rounded to two decimal places
 */
export function twoDecimals(value: number): number {
	return toFixedDecimals(value, 2);
}

/**
 * Round an input value to the spcified decimal precision
 *
 * @param value The input value
 * @param precision The required decimal place precision. This value must be between 0-20.
 * @returns The input value rounded to the specified precision
 */
export function toFixedDecimals(value: number, precision = 2): number {
	if (isNaN(value)) {
		return 0;
	}

	if (precision < 0) {
		return value;
	}

	if (precision > 20) {
		precision = 20;
	}

	const fixedValue = parseFloat(value.toFixed(precision));

	// safe-guard to prevent -0 values from being returned
	return Object.is(fixedValue, -0) ? 0 : parseFloat(value.toFixed(precision));
}

/**
 * Calculate the mean value for an array of numbers
 *
 * @param numbers The input numbers array
 * @returns The mean value for the input numbers array
 */
export function mean(numbers: number[]): number {
	const total = numbers.reduce((acum, number) => acum + number);

	return total / numbers.length;
}

/**
 * Calculate the median value for an array of numbers
 *
 * @param numbers The input numbers array
 * @returns The median value for the input numbers array
 */
export function median(srcNumbers: number[]): number {
	const numbers = srcNumbers.toSorted();

	let median = 0;
	const numsLen = numbers.length;

	if (numsLen % 2 === 0) {
		// is even
		// average of two middle numbers
		median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
	} else {
		// is odd
		// middle number only
		median = numbers[(numsLen - 1) / 2];
	}

	return median;
}
