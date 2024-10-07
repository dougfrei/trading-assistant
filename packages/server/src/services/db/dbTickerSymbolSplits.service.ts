import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'kysely';
import { DirectedOrderByStringReference } from 'kysely/dist/cjs/parser/order-by-parser';
import { Database } from 'src/db/db.module';
import { ITables } from 'src/db/types';
import { DbTickerSymbolSplitNew } from 'src/db/types/tables/tickerSymbolSplits';
import { TickerSymbolSplit } from 'src/entities/TickerSymbolSplit.model';
import { getErrorObject } from 'src/util/errors';

export interface IGetTickerSymbolSplitsParams {
	tickerSymbolId?: number;
	candlesUpdated?: boolean;
	order?: DirectedOrderByStringReference<ITables, 'ticker_symbol_splits', object>;
	limit?: number;
	offset?: number;
}

@Injectable()
export class DbTickerSymbolSplitsService {
	private readonly logger = new Logger(DbTickerSymbolSplitsService.name);

	constructor(private db: Database) {}

	/**
	 * Return multiple ticker symbol split database records
	 *
	 * @param params Query parameters
	 * @returns An array of TickerSymbolSplit entity objects
	 */
	async getTickerSymbolSplits(params: IGetTickerSymbolSplitsParams = {}) {
		let query = this.db.selectFrom('ticker_symbol_splits');

		if (typeof params.tickerSymbolId !== 'undefined') {
			query = query.where('ticker_symbol_id', '=', params.tickerSymbolId);
		}

		if (typeof params.candlesUpdated !== 'undefined') {
			query = query.where('candles_updated', '=', params.candlesUpdated);
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

		return records.map((record) => TickerSymbolSplit.fromDbRecord(record));
	}

	/**
	 * Create or update a single ticker symbol split database record
	 *
	 * @param values The values to update
	 * @returns The updated TickerSymbolSplit entity object or null if an error occurred
	 */
	async upsertTickerSymbolSplit(values: Omit<DbTickerSymbolSplitNew, 'id'>) {
		try {
			const newRecord = await this.db
				.insertInto('ticker_symbol_splits')
				.values(values)
				.onConflict((oc) =>
					oc.columns(['date', 'ticker_symbol_id']).doUpdateSet({
						from_value: sql`excluded.from_value`,
						to_value: sql`excluded.to_value`,
						candles_updated: sql`excluded.candles_updated`
					})
				)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TickerSymbolSplit.fromDbRecord(newRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while updating a ticker symbol split record'
			);

			this.logger.error({ stack: errObj.stack, upsertValues: values }, errObj.message);

			return null;
		}
	}
}
