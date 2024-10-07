import { Injectable, Logger } from '@nestjs/common';
import { DirectedOrderByStringReference } from 'kysely/dist/cjs/parser/order-by-parser';
import { Database } from 'src/db/db.module';
import { ITables } from 'src/db/types';
import { DbTradeAccountNew, DbTradeAccountUpdate } from 'src/db/types/tables/tradeAccounts';
import { TradeAccount } from 'src/entities/TradeAccount.model';
import { getErrorObject } from 'src/util/errors';

export interface IGetTradeAccountsParams {
	ids?: number[];
	userId?: number;
	label?: string;
	order?: DirectedOrderByStringReference<ITables, 'trade_accounts', object>;
	limit?: number;
	offset?: number;
}

export interface ICreateTradeAccountParams {
	label: string;
	supportedInstruments: string;
}

@Injectable()
export class DbTradeAccountService {
	private readonly logger = new Logger(DbTradeAccountService.name);

	constructor(private readonly db: Database) {}

	/**
	 * Retrieve multiple trade account records from the database
	 *
	 * @param params Query parameters
	 * @returns Array of TradeAccount entity objects
	 */
	async getTradeAccounts(params: IGetTradeAccountsParams = {}) {
		let query = this.db.selectFrom('trade_accounts');

		if (typeof params.ids !== 'undefined') {
			query = query.where('id', 'in', params.ids);
		}

		if (typeof params.userId !== 'undefined') {
			query = query.where('user_id', '=', params.userId);
		}

		if (typeof params.label !== 'undefined') {
			query = query.where('label', 'ilike', params.label);
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

		const tradeAccounts = records.map((record) => TradeAccount.fromDbRecord(record));

		return tradeAccounts;
	}

	/**
	 * Create a new trade account record in the database
	 *
	 * @param values The new trade account record values
	 * @returns The new TradeAccount entity object or null if an error occurred
	 */
	async createTradeAccount(values: DbTradeAccountNew) {
		try {
			const insertedRecord = await this.db
				.insertInto('trade_accounts')
				.values(values)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TradeAccount.fromDbRecord(insertedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while creating the trade account record'
			);

			this.logger.error({ stack: errObj.stack, createValues: values }, errObj.message);

			return null;
		}
	}

	/**
	 * Update a trade account record in the database by its ID
	 *
	 * @param tradeAccountId The trade account ID
	 * @param userId The associated user ID for ownership validation
	 * @param values The values to update
	 * @returns The updated TradeAccount entity object or null if an error occurred
	 */
	async updateTradeAccountById(
		tradeAccountId: number,
		userId: number,
		values: DbTradeAccountUpdate
	) {
		try {
			const updatedRecord = await this.db
				.updateTable('trade_accounts')
				.set(values)
				.where('id', '=', tradeAccountId)
				.where('user_id', '=', userId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TradeAccount.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while updating a trade account record by ID'
			);

			this.logger.error(
				{ stack: errObj.stack, tradeAccountId, updateValues: values },
				errObj.message
			);

			return null;
		}
	}

	/**
	 * Delete a trade account record from the database by its ID
	 *
	 * @param tradeAccountId The trade account record ID
	 * @param userId The associated user ID for ownership validation
	 * @returns The deleted TradeAccount entity object or null if an error occurred
	 */
	async deleteTradeAccountById(tradeAccountId: number, userId: number) {
		try {
			const deletedRecord = await this.db
				.deleteFrom('trade_accounts')
				.where('id', '=', tradeAccountId)
				.where('user_id', '=', userId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TradeAccount.fromDbRecord(deletedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while deleting a trade account record by ID'
			);

			this.logger.error({ stack: errObj.stack, tradeAccountId, userId }, errObj.message);

			return null;
		}
	}
}
