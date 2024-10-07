import { Injectable, Logger } from '@nestjs/common';
import { ETickerSymbolType } from '@trading-assistant/common';
import { DirectedOrderByStringReference } from 'kysely/dist/cjs/parser/order-by-parser';
import { Database } from 'src/db/db.module';
import { ITables } from 'src/db/types';
import { DbTickerSymbolNew, DbTickerSymbolUpdate } from 'src/db/types/tables/tickerSymbols';
import { TickerSymbol } from 'src/entities/TickerSymbol.model';
import EDatabaseConstants from 'src/enums/EDatabaseConstants';
import { getErrorObject } from 'src/util/errors';

export interface IGetTickerSymbolsParams {
	ids?: number[];
	names?: string[];
	type?: ETickerSymbolType;
	active?: boolean;
	gcis?: string[];
	search?: string;
	marketCapMin?: bigint;
	marketCapMax?: bigint;
	order?: DirectedOrderByStringReference<ITables, 'ticker_symbols', object>;
	limit?: number;
	offset?: number;
}

@Injectable()
export class DbTickerSymbolService {
	private readonly logger = new Logger(DbTickerSymbolService.name);

	constructor(private readonly db: Database) {}

	/**
	 * Return a single ticker symbol record from the database by its ID
	 *
	 * @param id The ticker symbol record ID
	 * @returns TickerSymbol entity object or null if no record is found
	 */
	async getTickerSymbolById(id: number): Promise<TickerSymbol | null> {
		const res = await this.db
			.selectFrom('ticker_symbols')
			.where('id', '=', id)
			.selectAll()
			.executeTakeFirst();

		return res ? TickerSymbol.fromDbRecord(res) : null;
	}

	/**
	 * Return a single ticker symbol record from the database by its name
	 *
	 * @param name The ticker symbol name
	 * @returns TickerSymbol entity object or null if no record is found
	 */
	async getTickerSymbolByName(name: string): Promise<TickerSymbol | null> {
		const res = await this.db
			.selectFrom('ticker_symbols')
			.where('name', '=', name)
			.selectAll()
			.executeTakeFirst();

		return res ? TickerSymbol.fromDbRecord(res) : null;
	}

	/**
	 * Return multiple ticker symbol records from the database
	 *
	 * @param params Query parameters
	 * @returns Array of TickerSymbol entity objects
	 */
	async getTickerSymbols(params: IGetTickerSymbolsParams = {}) {
		let query = this.db.selectFrom('ticker_symbols');

		if (typeof params.ids !== 'undefined') {
			query = query.where('id', 'in', params.ids);
		}

		if (typeof params.names !== 'undefined') {
			query = query.where('name', 'in', params.names);
		}

		if (typeof params.type !== 'undefined') {
			query = query.where('type', '=', params.type);
		}

		if (typeof params.active !== 'undefined') {
			query = query.where('active', '=', params.active);
		}

		if (typeof params.gcis !== 'undefined') {
			const gcis = params.gcis; // NOTE: this variable is being set and used instead of params.gcis in the "eb.or" callback below so TS doesn't think it could be undefined

			query = query.where((eb) => eb.or(gcis.map((gcis) => eb('gcis', 'like', `${gcis}%`))));
		}

		if (typeof params.search !== 'undefined') {
			query = query.where((eb) =>
				eb.or([
					eb('label', 'ilike', `%${params.search}%`),
					eb('name', 'ilike', `%${params.search}%`)
				])
			);
		}

		if (typeof params.marketCapMin !== 'undefined') {
			query = query.where('market_cap', '>=', params.marketCapMin);
		}

		if (typeof params.marketCapMax !== 'undefined') {
			query = query.where('market_cap', '<=', params.marketCapMax);
		}

		if (typeof params.order !== 'undefined') {
			query = query.orderBy(params.order);
		}

		if (typeof params.limit !== 'undefined') {
			query = query.limit(params.limit);
		}

		if (typeof params.offset !== 'undefined') {
			query = query.offset(params.offset);
		}

		const records = await query.selectAll().execute();

		return records.map((record) => TickerSymbol.fromDbRecord(record));
	}

	/**
	 * Return the total count of ticker symbol records matching the specified
	 * query parameters
	 *
	 * @param params Query parameters
	 * @returns The total count of ticker symbols matching the query parameters
	 */
	async getTickerSymbolsTotalCount(
		params: Omit<IGetTickerSymbolsParams, 'order' | 'limit' | 'offset'>
	) {
		let query = this.db.selectFrom('ticker_symbols');

		if (typeof params.ids !== 'undefined') {
			query = query.where('id', 'in', params.ids);
		}

		if (typeof params.names !== 'undefined') {
			query = query.where('name', 'in', params.names);
		}

		if (typeof params.type !== 'undefined') {
			query = query.where('type', '=', params.type);
		}

		if (typeof params.active !== 'undefined') {
			query = query.where('active', '=', params.active);
		}

		if (typeof params.gcis !== 'undefined') {
			const gcis = params.gcis; // NOTE: this variable is being set and used instead of params.gcis in the "eb.or" callback below so TS doesn't think it could be undefined

			query = query.where((eb) => eb.or(gcis.map((gcis) => eb('gcis', 'like', `${gcis}%`))));
		}

		if (typeof params.search !== 'undefined') {
			query = query.where((eb) =>
				eb.or([
					eb('label', 'ilike', `%${params.search}%`),
					eb('name', 'ilike', `%${params.search}%`)
				])
			);
		}

		const records = await query
			.select((builder) => builder.fn.countAll().as('count'))
			.executeTakeFirst();

		return Number(records?.count ?? 0);
	}

	/**
	 * Return an array of all ticker symbol names whose records are currently
	 * marked as active
	 *
	 * @returns Array of active ticker symbol names
	 */
	async getActiveTickerSymbolNames() {
		const records = await this.getTickerSymbols({
			active: true,
			order: 'name asc'
		});

		return records.map((record) => record.name);
	}

	/**
	 * Create a new ticker symbol record in the database
	 *
	 * @param values Ticker symbol values
	 * @returns The new TickerSymbol entity object or null if an error occurred
	 */
	async createTickerSymbol(values: DbTickerSymbolNew) {
		values = this.truncateTickerSymbolValues<DbTickerSymbolNew>(values);

		try {
			const newRecord = await this.db
				.insertInto('ticker_symbols')
				.values(values)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TickerSymbol.fromDbRecord(newRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while creating the ticker symbol record'
			);

			this.logger.error({ stack: errObj.stack, createValues: values }, errObj.message);

			return null;
		}
	}

	/**
	 * Create multiple ticker symbol records in the database
	 *
	 * @param valuesArray Array of ticker symbol values
	 * @returns The number of records created
	 */
	async createTickerSymbols(valuesArray: DbTickerSymbolNew[]) {
		if (!valuesArray.length) {
			return 0;
		}

		const insertValuesArray = valuesArray.map((values) =>
			this.truncateTickerSymbolValues<DbTickerSymbolNew>(values)
		);

		try {
			const insertResult = await this.db
				.insertInto('ticker_symbols')
				.values(insertValuesArray)
				.executeTakeFirstOrThrow();

			return Number(insertResult.numInsertedOrUpdatedRows);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while creating the ticker symbol records'
			);

			this.logger.error({ stack: errObj.stack, createValues: valuesArray }, errObj.message);

			return 0;
		}
	}

	/**
	 * Update a ticker symbol record in the database by its ID
	 *
	 * @param tickerSymbolId The ticker symbol record ID
	 * @param values The values to update
	 * @returns The updated TickerSymbol entity record or null if an error occurred
	 */
	async updateTickerSymbolById(
		tickerSymbolId: number | number[],
		values: Omit<DbTickerSymbolUpdate, 'id' | 'name'>
	) {
		values = this.truncateTickerSymbolValues<DbTickerSymbolUpdate>(values);

		try {
			const updatedRecord = await this.db
				.updateTable('ticker_symbols')
				.set(values)
				.where('id', Array.isArray(tickerSymbolId) ? 'in' : '=', tickerSymbolId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TickerSymbol.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while updating the ticker symbol record by ID'
			);

			this.logger.error(
				{ stack: errObj.stack, tickerSymbolId, updateValues: values },
				errObj.message
			);

			return null;
		}
	}

	/**
	 * Update a ticker symbol record in the database by its name
	 *
	 * @param tickerSymbolName The ticker symbol name
	 * @param values The values to update
	 * @returns The updated TickerSymbol entity record or null if an error occurred
	 */
	async updateTickerSymbolByName(
		tickerSymbolName: string | string[],
		values: Omit<DbTickerSymbolUpdate, 'id' | 'name'>
	) {
		values = this.truncateTickerSymbolValues(values);

		try {
			const updatedRecord = await this.db
				.updateTable('ticker_symbols')
				.set(values)
				.where('name', Array.isArray(tickerSymbolName) ? 'in' : '=', tickerSymbolName)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TickerSymbol.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while updating the ticker symbol record by name'
			);

			this.logger.error(
				{ stack: errObj.stack, tickerSymbolName, updateValues: values },
				errObj.message
			);

			return null;
		}
	}

	/**
	 * Delete a ticker symbol record from the database by its name
	 *
	 * @param tickerSymbol The ticker symbol name
	 * @returns The deleted TickerSymbol entity object or null if an error occurred
	 */
	async deleteTickerSymbolByName(tickerSymbol: string) {
		try {
			const deletedRecord = await this.db
				.deleteFrom('ticker_symbols')
				.where('name', '=', tickerSymbol)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TickerSymbol.fromDbRecord(deletedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while deleting a ticker symbol record by name'
			);

			this.logger.error({ stack: errObj.stack, tickerSymbol }, errObj.message);

			return null;
		}
	}

	/**
	 * Delete all ticker symbol records from the database
	 *
	 * @returns The number of deleted records
	 */
	async deleteAllTickerSymbols() {
		try {
			const res = await this.db.deleteFrom('ticker_symbols').executeTakeFirstOrThrow();

			return res.numDeletedRows;
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while deleting all ticker symbol records'
			);

			this.logger.error({ stack: errObj.stack }, errObj.message);

			return 0;
		}
	}

	/**
	 * Ensure that ticker symbol record values do not exceed database limitations.
	 * If they do, the affected values will be truncated and added to the
	 * 'truncated_values' field for reference.
	 *
	 * @param tickerSymbol The DbTickerSymbolNew or DbTickerSymbolUpdate object on which to truncate fields
	 * @returns The input value with truncated fields
	 */
	protected truncateTickerSymbolValues<T = DbTickerSymbolNew | DbTickerSymbolUpdate>(
		tickerSymbol: DbTickerSymbolNew | DbTickerSymbolUpdate
	): T {
		const truncatedValues: Record<string, number> = {};

		if (
			tickerSymbol.avg_daily_vol &&
			tickerSymbol.avg_daily_vol > EDatabaseConstants.MAX_PG_INTEGER_VALUE
		) {
			truncatedValues.avg_daily_vol = tickerSymbol.avg_daily_vol;
			tickerSymbol.avg_daily_vol = EDatabaseConstants.MAX_PG_INTEGER_VALUE;
		}

		if (
			tickerSymbol.last_price &&
			tickerSymbol.last_price > EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE
		) {
			truncatedValues.last_price = tickerSymbol.last_price;
			tickerSymbol.last_price = EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE;
		}

		if (
			tickerSymbol.all_time_high &&
			tickerSymbol.all_time_high > EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE
		) {
			truncatedValues.all_time_high = tickerSymbol.all_time_high;
			tickerSymbol.all_time_high = EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE;
		}

		if (
			tickerSymbol.all_time_low &&
			tickerSymbol.all_time_low > EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE
		) {
			truncatedValues.all_time_low = tickerSymbol.all_time_low;
			tickerSymbol.all_time_low = EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE;
		}

		if (
			tickerSymbol.ttm_high &&
			tickerSymbol.ttm_high > EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE
		) {
			truncatedValues.ttm_high = tickerSymbol.ttm_high;
			tickerSymbol.ttm_high = EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE;
		}

		if (
			tickerSymbol.ttm_low &&
			tickerSymbol.ttm_low > EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE
		) {
			truncatedValues.ttm_low = tickerSymbol.ttm_low;
			tickerSymbol.ttm_low = EDatabaseConstants.MAX_PG_NUMERIC_10_2_VALUE;
		}

		if (Object.keys(truncatedValues).length) {
			const prevValues = JSON.parse(tickerSymbol.truncated_values ?? '{}');

			tickerSymbol.truncated_values = JSON.stringify({ ...prevValues, ...truncatedValues });
		}

		return tickerSymbol as T;
	}
}
