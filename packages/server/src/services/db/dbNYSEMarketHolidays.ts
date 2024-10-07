import { Injectable, Logger } from '@nestjs/common';
import { getYMDdateString } from '@trading-assistant/common';
import { sql } from 'kysely';
import { DirectedOrderByStringReference } from 'kysely/dist/cjs/parser/order-by-parser';
import { Database } from 'src/db/db.module';
import { ITables } from 'src/db/types';
import { DbNYSEMarketHolidaysNew } from 'src/db/types/tables/nyseMarketHolidays';
import { NYSEMarketHoliday } from 'src/entities/NYSEMarketHoliday.model';
import { getErrorObject } from 'src/util/errors';

export interface IGetNYSEMarketHolidaysParams {
	startDate?: Date | null;
	endDate?: Date | null;
	excludeEarlyClose?: boolean;
	order?: DirectedOrderByStringReference<ITables, 'nyse_market_holidays', object>;
	limit?: number;
	offset?: number;
}

@Injectable()
export class DbNYSEMarketHolidaysService {
	private readonly logger = new Logger(DbNYSEMarketHolidaysService.name);

	constructor(private readonly db: Database) {}

	/**
	 * Return a single NYSEMarketHoliday entity object for the specified date
	 *
	 * @param dateObj Date object to retrieve a database record for
	 * @returns NYSEMarketHoliday entity object or null if no record can be found for the specified date
	 */
	async getSingle(dateObj: Date) {
		const res = await this.db
			.selectFrom('nyse_market_holidays')
			.where('date', '=', getYMDdateString(dateObj))
			.selectAll()
			.executeTakeFirst();

		return res ? NYSEMarketHoliday.fromDbRecord(res) : null;
	}

	/**
	 * Return multiple NYSEMarketHoliday entity objects based on the provided
	 * query parameters
	 *
	 * @param param Query parameters
	 * @returns Array of NYSEMarketHoliday entity objects
	 */
	async getMany({
		startDate = null,
		endDate = null,
		excludeEarlyClose = true,
		order = 'date asc',
		limit = 0,
		offset = 0
	}: IGetNYSEMarketHolidaysParams = {}) {
		let query = this.db.selectFrom('nyse_market_holidays');

		if (startDate) {
			query = query.where('date', '>=', getYMDdateString(startDate));
		}

		if (endDate) {
			query = query.where('date', '<=', getYMDdateString(endDate));
		}

		if (excludeEarlyClose) {
			query = query.where('is_early_close', '=', false);
		}

		if (order) {
			query = query.orderBy(order);
		}

		if (limit) {
			query = query.limit(limit);
		}

		if (offset) {
			query = query.offset(offset);
		}

		const records = await query.selectAll().execute();

		return records.map((record) => NYSEMarketHoliday.fromDbRecord(record));
	}

	/**
	 * Create or update multiple NYSE Market Holiday records
	 *
	 * @param records An array of DbNYSEMarketHolidaysNew records
	 * @returns The number of records that were created/updated
	 */
	async upsertMany(records: DbNYSEMarketHolidaysNew[]) {
		if (!records.length) {
			return 0;
		}

		try {
			const upsertResult = await this.db
				.insertInto('nyse_market_holidays')
				.values(records)
				.onConflict((oc) =>
					oc.column('date').doUpdateSet({
						is_early_close: sql`excluded.is_early_close`
					})
				)
				.executeTakeFirstOrThrow();

			return Number(upsertResult.numInsertedOrUpdatedRows);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while upserting NYSE market holiday records'
			);

			this.logger.error({ stack: errObj.stack, records }, errObj.message);

			return 0;
		}
	}
}
