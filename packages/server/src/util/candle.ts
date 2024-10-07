import { ECandlePeriodType } from '@trading-assistant/common';
import {
	endOfDay,
	endOfHour,
	endOfMonth,
	endOfWeek,
	endOfYear,
	startOfDay,
	startOfHour,
	startOfMonth,
	startOfWeek,
	startOfYear
} from 'date-fns';
import { Candle } from 'src/entities/Candle.model';

/**
 * Check if a candle indicator value is of the "number" type
 *
 * @param value An input value of an unknown type
 * @returns Boolean indicating that the input value is a number
 */
export function isCandleIndicatorNumericValue(value: unknown): value is number {
	return typeof value === 'number';
}

/**
 * Get the highest and lowest values for an array of Candle entity objects
 *
 * @param candles Array of Candle entity objects
 * @param limit The maximum amount of candles to include in the calculation (default is unlimited "0")
 * @returns An object with "high" and "low" properties containing the respective values
 */
export function getCandlesHighLowValues(
	candles: Candle[],
	limit = 0
): { high: number; low: number } {
	let procCandles = candles;

	if (limit && candles.length > limit) {
		procCandles = candles.splice(candles.length - limit);
	}

	return procCandles.reduce(
		(acum, candle) => {
			if (acum.low === 0 || candle.low < acum.low) {
				acum.low = candle.low;
			}

			if (acum.high === 0 || candle.high > acum.high) {
				acum.high = candle.high;
			}

			return acum;
		},
		{ high: 0, low: 0 }
	);
}

/**
 * Returns an average of volume for the period length specified
 *
 * @param candles Array of Candle entity objects
 * @param period The number of periods used to calculate the average volume (default is 20)
 * @returns The average volume for the provided period length
 */
export function getAverageVolumeForCandles(candles: Candle[], period = 20): number {
	if (!candles.length) {
		return 0;
	}

	// sort from the most recent period to the oldest and return a slice the length of the requested period
	const latestCandles = candles
		.toSorted((a, b) => b.period.getTime() - a.period.getTime())
		.slice(0, candles.length > period ? period : candles.length);

	const totalVol = latestCandles.reduce((acum, candle) => (acum += candle.volume), 0);
	const avgVol = Math.round(totalVol / latestCandles.length);

	return avgVol;
}

/**
 * Returns the most recent candle from an array sorted by period
 *
 * @param candles An array of Candle entity objects
 * @returns The most recent candle or null if the input array is empty
 */
export function getMostRecentCandle(candles: Candle[]): Candle | null {
	const sortedCandles = candles.toSorted((a, b) => b.period.getTime() - a.period.getTime());

	return sortedCandles[0] ?? null;
}

/**
 * Return start/end Date objects representing a derivative period based on the
 * provided source period Date object
 *
 * @param periodType The derivative period type
 * @param srcPeriod The source period date object
 * @returns An object with "start" and "end" properties containing Date objects
 */
export function getDerivativeDateObjects(
	periodType: ECandlePeriodType,
	srcPeriod: Date
): { start: Date; end: Date } {
	let startPeriod = srcPeriod;
	let endPeriod = srcPeriod;

	switch (periodType) {
		case ECandlePeriodType.H:
			startPeriod = startOfHour(srcPeriod);
			endPeriod = endOfHour(srcPeriod);
			break;

		case ECandlePeriodType.D:
			startPeriod = startOfDay(srcPeriod);
			endPeriod = endOfDay(srcPeriod);
			break;

		case ECandlePeriodType.W:
			startPeriod = startOfWeek(srcPeriod, { weekStartsOn: 1 });
			endPeriod = endOfWeek(srcPeriod, { weekStartsOn: 1 });
			break;

		case ECandlePeriodType.M:
			startPeriod = startOfMonth(srcPeriod);
			endPeriod = endOfMonth(srcPeriod);
			break;

		case ECandlePeriodType.Y:
			startPeriod = startOfYear(srcPeriod);
			endPeriod = endOfYear(srcPeriod);
			break;

		default:
			break;
	}

	return { start: startPeriod, end: endPeriod };
}
