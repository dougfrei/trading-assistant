import { Injectable } from '@nestjs/common';
import { DirectedOrderByStringReference } from 'kysely/dist/cjs/parser/order-by-parser';
import { Database } from 'src/db/db.module';
import { ITables } from 'src/db/types';
import { ScreenerQuery } from 'src/entities/ScreenerQuery.model';

@Injectable()
export class DbScreenerQueryService {
	constructor(private db: Database) {}

	/**
	 * Return a single screener query record from the database by its ID
	 *
	 * @param id The screener query record ID
	 * @returns ScreenQuery entity object or null if no record is found
	 */
	async getById(id: number): Promise<ScreenerQuery | null> {
		const record = await this.db
			.selectFrom('screener_queries')
			.where('id', '=', id)
			.selectAll()
			.executeTakeFirst();

		return record ? ScreenerQuery.fromDbRecord(record) : null;
	}

	/**
	 * Retrieve multiple screener query records from the database
	 *
	 * @param params Query parameters
	 * @returns Array of ScreenerQuery entity objects
	 */
	async getScreenerQueries(
		params: {
			order?: DirectedOrderByStringReference<ITables, 'screener_queries', object>;
			limit?: number;
			offset?: number;
		} = {}
	) {
		let query = this.db.selectFrom('screener_queries');

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

		return records.map((record) => ScreenerQuery.fromDbRecord(record));
	}
}
