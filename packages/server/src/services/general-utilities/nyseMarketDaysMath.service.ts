import { Injectable } from '@nestjs/common';
import { getYMDdateString } from '@trading-assistant/common';
import { addDays, isWeekend, nextDay, previousDay, subDays } from 'date-fns';
import { DbNYSEMarketHolidaysService } from 'src/services/db/dbNYSEMarketHolidays';

@Injectable()
export class NYSEMarketDaysMathService {
	constructor(private readonly dbNYSEMarketHolidaysService: DbNYSEMarketHolidaysService) {}

	/**
	 * Return a new date object that is the result of adding a number of trading
	 * days to the specified initial date
	 *
	 * @param initialDate A date object representing the starting date for the calculation
	 * @param daysToAdd The amount of trading days to add
	 * @returns The result date object
	 */
	async addTradingDays(initialDate: Date, daysToAdd: number) {
		const holidayRecords = await this.dbNYSEMarketHolidaysService.getMany({
			startDate: initialDate
		});
		const holidayLookupSet = new Set(holidayRecords.map((record) => record.date));

		let daysPassed = 0;
		let currentDay = initialDate;

		while (daysPassed < daysToAdd) {
			currentDay = addDays(currentDay, 1);

			if (isWeekend(currentDay) || holidayLookupSet.has(getYMDdateString(currentDay))) {
				continue;
			}

			daysPassed += 1;
		}

		return currentDay;
	}

	/**
	 * Return a new date object that is the result of subtracting a number of
	 * trading days from the specified initial date
	 *
	 * @param initialDate A date object representing the starting date for the calculation
	 * @param daysToSubtract The amount of trading days to subtract
	 * @returns The result date object
	 */
	async subtractTradingDays(initialDate: Date, daysToSubtract: number) {
		const holidayRecords = await this.dbNYSEMarketHolidaysService.getMany({
			endDate: initialDate
		});
		const holidayLookupSet = new Set(holidayRecords.map((record) => record.date));

		let daysPassed = 0;
		let currentDay = initialDate;

		while (daysPassed < daysToSubtract) {
			currentDay = subDays(currentDay, 1);

			if (isWeekend(currentDay) || holidayLookupSet.has(getYMDdateString(currentDay))) {
				continue;
			}

			daysPassed += 1;
		}

		return currentDay;
	}

	/**
	 * Return a new date object that is the result of adding a number of calendar
	 * days to the specified initial date. If the resulting date lands on a weekend
	 * it can be configured to move to the previous or next market open day.
	 *
	 * @param initialDate A date object representing the starting date for the calculation
	 * @param daysToAdd The amount of calendar days to add
	 * @param closureRounding Determine how to handle results that land on a weekend or market holiday
	 * @returns The result date object
	 */
	async addCalendarDays(
		initialDate: Date,
		daysToAdd: number,
		closureRounding: 'round_up' | 'round_down' = 'round_up'
	) {
		const holidayRecords = await this.dbNYSEMarketHolidaysService.getMany({
			startDate: initialDate
		});
		const holidayLookupSet = new Set(holidayRecords.map((record) => record.date));

		let targetDay = addDays(initialDate, daysToAdd);

		if (isWeekend(targetDay)) {
			targetDay =
				closureRounding === 'round_up'
					? nextDay(targetDay, 1 /* Monday */)
					: previousDay(targetDay, 5 /* Friday */);
		}

		let isHoliday = holidayLookupSet.has(getYMDdateString(targetDay));

		while (isHoliday === true) {
			targetDay =
				closureRounding === 'round_up' ? addDays(targetDay, 1) : subDays(targetDay, 1);

			isHoliday = holidayLookupSet.has(getYMDdateString(targetDay));
		}

		return targetDay;
	}

	/**
	 * Return a new date object that is the result of subtracting a number of
	 * calendar days from the specified initial date. If the resulting date lands
	 * on a weekend it can be configured to move to the previous or next market
	 * open day.
	 *
	 * @param initialDate A date object representing the starting date for the calculation
	 * @param daysToSubtract The amount of calendar days to subtract
	 * @param closureRounding Determine how to handle results that land on a weekend or market holiday
	 * @returns The result date object
	 */
	async subtractCalendarDays(
		initialDate: Date,
		daysToSubtract: number,
		closureRounding: 'round_up' | 'round_down' = 'round_down'
	) {
		const holidayRecords = await this.dbNYSEMarketHolidaysService.getMany({
			endDate: initialDate
		});
		const holidayLookupSet = new Set(holidayRecords.map((record) => record.date));

		let targetDay = subDays(initialDate, daysToSubtract);

		if (isWeekend(targetDay)) {
			targetDay =
				closureRounding === 'round_up'
					? nextDay(targetDay, 1 /* Monday */)
					: previousDay(targetDay, 5 /* Friday */);
		}

		let isHoliday = holidayLookupSet.has(getYMDdateString(targetDay));

		while (isHoliday === true) {
			targetDay =
				closureRounding === 'round_up' ? addDays(targetDay, 1) : subDays(targetDay, 1);

			isHoliday = holidayLookupSet.has(getYMDdateString(targetDay));
		}

		return targetDay;
	}
}
