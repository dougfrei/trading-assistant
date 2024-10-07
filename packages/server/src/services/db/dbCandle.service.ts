import { Injectable, Logger } from '@nestjs/common';
import { ECandlePeriodType } from '@trading-assistant/common';
import { SelectQueryBuilder, sql } from 'kysely';
import { Database } from 'src/db/db.module';
import { ITables } from 'src/db/types';
import { DbCandleNew, DbCandleUpdate } from 'src/db/types/tables/candles';
import { Candle } from 'src/entities/Candle.model';
import EDatabaseConstants from 'src/enums/EDatabaseConstants';
import { RequireAtLeastOne } from 'src/types';
import { getErrorObject } from 'src/util/errors';
import { twoDecimals } from 'src/util/math';

export interface IGetCandlesArgs {
	periodType: ECandlePeriodType;
	periodCompare?: Date;
	periodCompareOperator?: '=' | '>' | '<' | '>=' | '<=';
	periodCompareDateOnly?: boolean;
	limit?: number;
	order?: 'period_desc' | 'period_asc';
}

interface IGetCandleArgs {
	tickerSymbolId: number;
	period: Date;
	periodType?: ECandlePeriodType;
}

@Injectable()
export class DbCandleService {
	private readonly logger = new Logger(DbCandleService.name);

	constructor(private readonly db: Database) {}

	/**
	 * Execute a candle database query by exposing a Kysely instance via a callback
	 * for control over the query logic.
	 *
	 * @param queryModFunc A callback function that receives a Kysely query object and is expected to return a Kysely query object
	 * @returns Array of Candle entity objects
	 */
	async getCandlesFlexibleQuery(
		queryModFunc: (
			query: SelectQueryBuilder<ITables, 'candles', object>
		) => SelectQueryBuilder<ITables, 'candles', object>
	) {
		let query = this.db.selectFrom('candles');

		query = queryModFunc(query);

		if (!('selectAll' in query) || !('execute' in query)) {
			throw new Error(
				'getCandlesFlexibleQuery callback function did not return a valid Kysely query instance'
			);
		}

		const records = await query.selectAll().execute();

		return records.map((record) => Candle.fromDbRecord(record));
	}

	/**
	 * Retrieve a single candle record from the database
	 *
	 * @param param The query parameters
	 * @returns Candle entity object or null if no candle record was found
	 */
	async getCandle({ tickerSymbolId, period, periodType = ECandlePeriodType.D }: IGetCandleArgs) {
		const record = await this.db
			.selectFrom('candles')
			.where('ticker_symbol_id', '=', tickerSymbolId)
			.where('period', '=', period)
			.where('period_type', '=', periodType)
			.selectAll()
			.executeTakeFirst();

		return record ? Candle.fromDbRecord(record) : null;
	}

	/**
	 * Retreive multiple candle records by ticker symbol ID(s) from the database
	 *
	 * @param tickerSymbolId A singular ticker symbol record ID or an array of ticker symbol record IDs
	 * @param param The query parameters
	 * @returns Array of Candle entity objects
	 */
	async getCandlesByTickerSymbolId(
		tickerSymbolId: number | number[],
		{
			periodType = ECandlePeriodType.D,
			periodCompare = undefined,
			periodCompareOperator = '=',
			periodCompareDateOnly = true,
			limit = 0,
			order = 'period_desc'
		}: IGetCandlesArgs
	) {
		let query = this.db
			.selectFrom('candles')
			.where(
				'candles.ticker_symbol_id',
				Array.isArray(tickerSymbolId) ? 'in' : '=',
				tickerSymbolId
			)
			.where('candles.period_type', '=', periodType);

		if (periodCompare) {
			query = query.where(
				periodCompareDateOnly ? sql`DATE(candles.period)` : 'candles.period',
				periodCompareOperator,
				periodCompare
			);
		}

		if (limit > 0) {
			query = query.limit(limit);
		}

		query = query.orderBy('candles.period', order === 'period_desc' ? 'desc' : 'asc');

		const res = await query.selectAll().execute();

		return res.map((record) => Candle.fromDbRecord(record));
	}

	/**
	 * Retreive multiple candle records by ticker symbol name from the database
	 *
	 * @param tickerSymbolName The ticker symbol name
	 * @param param The query parameters
	 * @returns Array of Candle entity objects
	 */
	async getCandlesByTickerSymbolName(
		tickerSymbolName: string,
		{
			periodType = ECandlePeriodType.D,
			periodCompare = undefined,
			periodCompareOperator = '=',
			periodCompareDateOnly = true,
			limit = 0,
			order = 'period_desc'
		}: IGetCandlesArgs
	) {
		let query = this.db.selectFrom('candles');

		query = query
			.innerJoin('ticker_symbols', 'ticker_symbols.id', 'candles.ticker_symbol_id')
			.where('ticker_symbols.name', '=', tickerSymbolName)
			.where('candles.period_type', '=', periodType);

		if (periodCompare) {
			query = query.where(
				periodCompareDateOnly ? sql`DATE(candles.period)` : 'candles.period',
				periodCompareOperator,
				periodCompare
			);
		}

		query = query.orderBy('candles.period', order === 'period_desc' ? 'desc' : 'asc');

		if (limit > 0) {
			query = query.limit(limit);
		}

		const res = await query
			.select([
				'candles.id',
				'candles.ticker_symbol_id',
				'candles.open',
				'candles.high',
				'candles.low',
				'candles.close',
				'candles.volume',
				'candles.period',
				'candles.period_type',
				'candles.indicators',
				'candles.alerts',
				'candles.truncated_values'
			])
			.execute();

		return res.map((record) => Candle.fromDbRecord(record));
	}

	/**
	 * Create a new candle record in the database
	 *
	 * @param values The new candle values
	 * @returns The created Candle entity object or null if an error occurred
	 */
	async createCandle(values: DbCandleNew) {
		values = this.truncateCandleValues<DbCandleNew>(values);

		try {
			const newRecord = await this.db
				.insertInto('candles')
				.values(values)
				.returningAll()
				.executeTakeFirstOrThrow();

			return Candle.fromDbRecord(newRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(err, 'An error occurred while creating a candle record');

			this.logger.error({ stack: errObj.stack, createCandleValues: values }, errObj.message);

			return null;
		}
	}

	/**
	 * Create multiple new candle records in the database
	 *
	 * @param valuesArray An array of new candle values
	 * @returns The number of new records created
	 */
	async createCandles(valuesArray: DbCandleNew[]) {
		if (!valuesArray.length) {
			return 0;
		}

		const insertValuesArray = valuesArray.map((values) =>
			this.truncateCandleValues<DbCandleNew>(values)
		);

		try {
			const res = await this.db
				.insertInto('candles')
				.values(insertValuesArray)
				.executeTakeFirstOrThrow();

			return Number(res.numInsertedOrUpdatedRows);
		} catch (err: unknown) {
			const errObj = getErrorObject(err, 'An error occurred while creating candle records');

			this.logger.error({ stack: errObj.stack }, errObj.message);

			return 0;
		}
	}

	/**
	 * Update an existing candle record in the database by its ID
	 *
	 * @param candleId The existing candle record ID
	 * @param values The values to update
	 * @returns The updated Candle entity object or null if an error occurred
	 */
	async updateCandleById(candleId: number, values: DbCandleUpdate) {
		values = this.truncateCandleValues<DbCandleUpdate>(values);

		try {
			const updatedRecord = await this.db
				.updateTable('candles')
				.set(values)
				.where('id', '=', candleId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return Candle.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(err, 'An error occurred while updating a candle record');

			this.logger.error(
				{
					stack: errObj.stack,
					candleId,
					values
				},
				errObj.message
			);

			return null;
		}
	}

	/**
	 * Update the OHLCV (open, high, low, close, volume) values of multiple
	 * candle records in the database.
	 *
	 * @param records An array of DbCandleUpdate objects
	 * @returns The number of updated records
	 */
	async updateManyCandlesOHLCV(records: DbCandleUpdate[]) {
		const sanitizedRecords = records.map((record) =>
			this.truncateCandleValues<DbCandleUpdate>(record)
		);

		const valueClauses = sanitizedRecords.map(
			(record) =>
				`(${record.id}, ${record.open}, ${record.high}, ${record.low}, ${record.close}, ${record.volume}, '${record.truncated_values ?? {}}'::json)`
		);

		const updateRes = await this.db
			.updateTable('candles')
			.from(
				// @ts-expect-error Kysely doesn't seem to have a way to do this without a typing error
				sql`(VALUES ${sql.raw(valueClauses.join(','))}) AS c(ref_id, new_open, new_high, new_low, new_close, new_volume, new_truncated_values)`
			)
			.set({
				// @ts-expect-error Kysely doesn't seem to have a way to do this without a typing error
				open: sql`c.new_open`,
				high: sql`c.new_high`,
				low: sql`c.new_low`,
				close: sql`c.new_close`,
				volume: sql`c.new_volume`,
				truncated_values: sql`c.new_truncated_values`
			})
			// @ts-expect-error Kysely doesn't seem to have a way to do this without a typing error
			.where('candles.id', '=', sql`c.ref_id`)
			.executeTakeFirst();

		return Number(updateRes.numUpdatedRows);
	}

	/**
	 * Delete multiple candle records from the database by their IDs
	 *
	 * @param candleIds An array of candle record IDs
	 * @returns The number of deleted records
	 */
	async deleteCandlesByIds(candleIds: number[]) {
		try {
			const deleteResult = await this.db
				.deleteFrom('candles')
				.where('id', 'in', candleIds)
				.executeTakeFirstOrThrow();

			return Number(deleteResult.numDeletedRows);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while deleting candle records by IDs'
			);

			this.logger.error({ stack: errObj.stack, candleIds }, errObj.message);

			return 0;
		}
	}

	/**
	 * Delete multiple candles from the database based on a combination of their
	 * ticker symbol IDs, period types, and period ranges.
	 *
	 * @param params The delete parameters
	 * @returns The number of deleted candle records
	 */
	async deleteCandles(
		params: RequireAtLeastOne<{
			tickerSymbolId?: number | number[];
			periodType?: ECandlePeriodType;
			periodRange?: {
				start: Date;
				end: Date;
			};
		}>
	) {
		try {
			let query = this.db.deleteFrom('candles');

			if (typeof params.tickerSymbolId !== 'undefined') {
				if (Array.isArray(params.tickerSymbolId)) {
					query = query.where('ticker_symbol_id', 'in', params.tickerSymbolId);
				} else {
					query = query.where('ticker_symbol_id', '=', params.tickerSymbolId);
				}
			}

			if (typeof params.periodType !== 'undefined') {
				query = query.where('period_type', '=', params.periodType);
			}

			if (typeof params.periodRange !== 'undefined') {
				query = query
					.where('period', '>=', params.periodRange.start)
					.where('period', '<=', params.periodRange.end);
			}

			const deleteResult = await query.executeTakeFirstOrThrow();

			return Number(deleteResult.numDeletedRows);
		} catch (err: unknown) {
			const errObj = getErrorObject(err, 'An error occurred while deleting candle records');

			this.logger.error({ stack: errObj.stack, deleteCandlesParams: params }, errObj.message);

			return 0;
		}
	}

	/**
	 * Delete all candle records from the database
	 *
	 * @returns The number of deleted records
	 */
	async deleteAllCandles() {
		try {
			const deleteResult = await this.db.deleteFrom('candles').executeTakeFirst();

			return Number(deleteResult.numDeletedRows);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while deleting all candle records'
			);

			this.logger.error({ stack: errObj.stack }, errObj.message);

			return 0;
		}
	}

	/**
	 * Create multiple candle records in the database associated with the
	 * specified ticker symbol ID
	 *
	 * @param tickerSymbolId The associated ticker symbol ID
	 * @param candles An array of Candle entity objects
	 * @param opts Options object
	 * @returns The number of candle records created
	 */
	async createFromCandleObjects(
		tickerSymbolId: number,
		candles: Candle[],
		opts: { replace: boolean } = { replace: false }
	) {
		if (!candles.length) {
			this.logger.warn(
				{
					tickerSymbolId
				},
				'dbCandle.createFromCandleObjects called with empty candles array'
			);

			return 0;
		}

		if (opts.replace) {
			await this.deleteCandles({ tickerSymbolId });
		}

		// prevent candles with existing records that match the same period and
		// periodType from being created
		const existingCandles = await this.getCandlesByTickerSymbolId(tickerSymbolId, {
			periodType: candles[0].periodType
		});
		const filteredCandles = candles.filter(
			(candle) =>
				existingCandles.findIndex(
					(existing) =>
						existing.period === candle.period &&
						existing.periodType === candle.periodType
				) === -1
		);

		if (filteredCandles.length) {
			const newCandles: DbCandleNew[] = filteredCandles.map((candle) => ({
				ticker_symbol_id: tickerSymbolId,
				open: candle.open,
				high: candle.high,
				low: candle.low,
				close: candle.close,
				volume: candle.volume,
				period: candle.period,
				period_type: candle.periodType
			}));

			const res = await this.createCandles(newCandles);

			return res;
		}

		return 0;
	}

	/**
	 * Ensure that candle record values do not exceed database limitations.
	 * If they do, the affected values will be truncated and added to the
	 * 'truncated_values' field for reference.
	 *
	 * @param candle The DbCandleNew or DbCandleUpdate object on which to truncate fields
	 * @returns The input value with truncated fields
	 */
	protected truncateCandleValues<T = DbCandleNew | DbCandleUpdate>(
		candle: DbCandleNew | DbCandleUpdate
	): T {
		const truncatedValues: Record<string, number> = {};

		if (candle.open) {
			candle.open = twoDecimals(candle.open);

			if (candle.open > EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE) {
				truncatedValues.open = candle.open;
				candle.open = EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE;
			}
		}

		if (candle.high) {
			candle.high = twoDecimals(candle.high);

			if (candle.high > EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE) {
				truncatedValues.high = candle.high;
				candle.high = EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE;
			}
		}

		if (candle.low) {
			candle.low = twoDecimals(candle.low);

			if (candle.low > EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE) {
				truncatedValues.low = candle.low;
				candle.low = EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE;
			}
		}

		if (candle.close) {
			candle.close = twoDecimals(candle.close);

			if (candle.close > EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE) {
				truncatedValues.close = candle.close;
				candle.close = EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE;
			}
		}

		if (candle.volume) {
			candle.volume = Math.round(candle.volume);

			if (candle.volume > EDatabaseConstants.MAX_PG_INTEGER_VALUE) {
				truncatedValues.volume = candle.volume;
				candle.volume = EDatabaseConstants.MAX_PG_INTEGER_VALUE;
			}
		}

		if (Object.keys(truncatedValues).length) {
			const prevValues = JSON.parse(candle.truncated_values ?? '{}');

			candle.truncated_values = JSON.stringify({ ...prevValues, ...truncatedValues });
		}

		return candle as T;
	}
}
