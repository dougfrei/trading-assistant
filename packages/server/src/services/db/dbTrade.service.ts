import { Injectable, Logger } from '@nestjs/common';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { sql } from 'kysely';
import { DirectedOrderByStringReference } from 'kysely/dist/cjs/parser/order-by-parser';
import { Database } from 'src/db/db.module';
import { ITables } from 'src/db/types';
import { DbTradeNew, DbTradeUpdate } from 'src/db/types/tables/trades';
import { Trade } from 'src/entities/Trade.model';
import { getErrorObject } from 'src/util/errors';

export interface IGetTradesParams {
	userId?: number;
	accountId?: number | number[];
	instrumentType?: ETradeInstrumentType | ETradeInstrumentType[];
	optionSpreadTemplate?: string | string[];
	tickerSymbol?: string;
	isClosed?: boolean;
	betweenDates?: {
		start: Date;
		end: Date;
	};
	useOpenFirstOrdering?: boolean;
	order?: DirectedOrderByStringReference<ITables, 'trades', object>;
	limit?: number;
	offset?: number;
}

@Injectable()
export class DbTradeService {
	private readonly logger = new Logger(DbTradeService.name);

	constructor(private readonly db: Database) {}

	/**
	 * Retrieve a trade record from the database by its ID
	 *
	 * @param tradeId The trade record ID
	 * @param userId The associated user ID for ownership validation
	 * @returns The Trade entity object or null if no record could be found
	 */
	async getTradeById(tradeId: number, userId: number) {
		const res = await this.db
			.selectFrom('trades')
			.where('id', '=', tradeId)
			.where('user_id', '=', userId)
			.selectAll()
			.executeTakeFirst();

		return res ? Trade.fromDbRecord(res) : null;
	}

	/**
	 * Construct the base trades query used by other methods within this class
	 *
	 * @param params Query parameters
	 * @returns Kysely query object
	 */
	protected getTradesBaseQuery(
		params: Omit<IGetTradesParams, 'useOpenFirstOrdering' | 'order' | 'limit' | 'offset'>
	) {
		let query = this.db.selectFrom('trades');

		if (typeof params.userId !== 'undefined') {
			query = query.where('user_id', '=', params.userId);
		}

		if (typeof params.tickerSymbol !== 'undefined' && params.tickerSymbol.trim().length > 0) {
			query = query
				.innerJoin('ticker_symbols', 'ticker_symbols.name', 'trades.ticker_symbol')
				.where('ticker_symbols.name', '=', params.tickerSymbol.trim());
		}

		if (
			typeof params.accountId !== 'undefined' &&
			(Array.isArray(params.accountId) ? params.accountId.length > 0 : params.accountId > 0)
		) {
			query = query.where(
				'account_id',
				Array.isArray(params.accountId) ? 'in' : '=',
				params.accountId
			);
		}

		if (
			(Array.isArray(params.instrumentType) && params.instrumentType.length > 0) ||
			(typeof params.instrumentType === 'string' && params.instrumentType.trim().length > 0)
		) {
			query = query.where(
				'instrument_type',
				Array.isArray(params.instrumentType) ? 'in' : '=',
				params.instrumentType
			);
		}

		if (
			typeof params.optionSpreadTemplate !== 'undefined' &&
			(Array.isArray(params.optionSpreadTemplate)
				? params.optionSpreadTemplate.length > 0
				: params.optionSpreadTemplate.trim().length > 0)
		) {
			query = query.where(
				'option_spread_template',
				Array.isArray(params.optionSpreadTemplate) ? 'in' : '=',
				params.optionSpreadTemplate
			);
		}

		if (params.isClosed) {
			query = query.where('close_date_time', '!=', null);
		}

		if (typeof params.betweenDates !== 'undefined') {
			if (typeof params.betweenDates.start !== 'undefined') {
				query = query.where('close_date_time', '>=', params.betweenDates.start);
			}

			if (typeof params.betweenDates.end !== 'undefined') {
				query = query.where('close_date_time', '<=', params.betweenDates.end);
			}
		}

		return query;
	}

	/**
	 * Retrieve multiple trade records from the database
	 *
	 * @param params Query parameters
	 * @returns Array of Trade entity objects
	 */
	async getTrades(params: IGetTradesParams) {
		let query = this.getTradesBaseQuery(params);

		if (typeof params.useOpenFirstOrdering !== 'undefined' && params.useOpenFirstOrdering) {
			query = query
				.orderBy(sql`close_date_time IS NULL desc`)
				.orderBy('close_date_time desc');
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

		return records.map((record) => Trade.fromDbRecord(record));
	}

	/**
	 * Return the total number of matching trade records in the database for the
	 * specified query parameters
	 *
	 * @param params Query parameters
	 * @returns The total number of matching trade records
	 */
	async getTradesCount(params: Omit<IGetTradesParams, 'order' | 'limit' | 'offset'>) {
		const records = await this.getTradesBaseQuery(params)
			.select((builder) => builder.fn.countAll().as('count'))
			.executeTakeFirst();

		return Number(records?.count ?? 0);
	}

	/**
	 * Create a new trade record in the database
	 *
	 * @param values The trade record values
	 * @returns The created Trade entity object or null if an error occurred
	 */
	async createTrade(values: DbTradeNew) {
		try {
			const insertedRecord = await this.db
				.insertInto('trades')
				.values(values)
				.returningAll()
				.executeTakeFirstOrThrow();

			return Trade.fromDbRecord(insertedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(err, 'An error occurred while creating a trade record');

			this.logger.error({ stack: errObj.stack, createValues: values }, errObj.message);

			return null;
		}
	}

	/**
	 * Update an existing trade record in the database by its ID
	 *
	 * @param tradeId The trade record ID
	 * @param userId The associated user ID for validation
	 * @param values The values to update
	 * @returns The updated Trade entity object or null if an error occurred
	 */
	async updateTradeById(tradeId: number, userId: number, values: DbTradeUpdate) {
		try {
			const updatedRecord = await this.db
				.updateTable('trades')
				.set(values)
				.where('id', '=', tradeId)
				.where('user_id', '=', userId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return Trade.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while updating a trade record by ID'
			);

			this.logger.error(
				{ stack: errObj.stack, tradeId, updateValues: values },
				errObj.message
			);

			return null;
		}
	}

	/**
	 * Delete a trade record from the database by its ID
	 *
	 * @param tradeId The trade record ID
	 * @param userId The associated user ID for validation
	 * @returns The deleted Trade entity object or null if an error occurred
	 */
	async deleteTradeById(tradeId: number, userId: number) {
		try {
			const deletedRecord = await this.db
				.deleteFrom('trades')
				.where('id', '=', tradeId)
				.where('user_id', '=', userId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return Trade.fromDbRecord(deletedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while deleting a trade record by ID'
			);

			this.logger.error({ stack: errObj.stack, tradeId }, errObj.message);

			return null;
		}
	}
}
