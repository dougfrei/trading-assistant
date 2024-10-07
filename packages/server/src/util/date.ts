import { Temporal } from 'temporal-polyfill';

/**
 * Construct a date object from an ISO-8601 string in the America/New_York timezone.
 * The ISO-8601 value should not include timezone information. For example, use
 * "2024-01-02T09:30:00" instead of "2024-01-02T09:30:00Z" to construct a date
 * object representing Jan 1, 2024 at 9:30am in the America/New_York timezone.
 *
 * @param isoValue The ISO-8601 string
 * @returns A date object constructed in the America/New_York timezone
 */
export function getNYDateObject(isoValue: string) {
	const nyDateObj = Temporal.ZonedDateTime.from(`${isoValue}[America/New_York]`);

	return new Date(nyDateObj.epochMilliseconds);
}

/**
 * Construct a date object in the America/New_York timezone at 9:30am with the
 * specified date string in "YYYY-MM-DD" format.
 *
 * @param ymdValue Date value in "YYYY-MM-DD" format
 * @returns A date object representing the specified date at 9:30am in the America/New_York timezone
 */
export function getNYMarketOpenDateObject(ymdValue: string) {
	return getNYDateObject(`${ymdValue}T09:30:00`);
}

/**
 * Returns an array of triple witching dates for the specified year.
 *
 * Triple witching is when the expiration of stock options, stock index futures,
 * and stock index options all fall on the same day. It only happens four times
 * a year – on the third Friday of March, June, September, and December
 *
 * Reference: https://www.forex.com/en-us/news-and-analysis/what-is-triple-witching/
 *
 * @param year The year to get triple witching dates for
 * @returns Array of strings representing dates in "YYYY-MM-DD" format
 */
export function getTripleWitchingDates(yearStart: number, yearEnd = 0): string[] {
	const twoDigitString = (digit: number): string =>
		digit >= 10 ? digit.toString() : `0${digit}`;
	const tripleWitchingDates: string[] = [];

	if (!yearEnd || yearEnd < yearStart) {
		yearEnd = new Date().getFullYear();
	}

	for (let year = yearStart; year <= yearEnd; year++) {
		for (let month = 3; month <= 12; month += 3) {
			const numDaysInMonth = new Date(year, month, 0).getDate();
			const fridays: string[] = [];

			for (let day = 1; day <= numDaysInMonth; day++) {
				const dayOfWeek = new Date(year, month - 1, day).getDay();

				if (dayOfWeek === 5) {
					fridays.push(`${year}-${twoDigitString(month)}-${twoDigitString(day)}`);
				}
			}

			if (fridays.length >= 3) {
				tripleWitchingDates.push(fridays[2]);
			}
		}
	}

	return tripleWitchingDates;
}
