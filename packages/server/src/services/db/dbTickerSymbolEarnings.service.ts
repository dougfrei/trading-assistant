import { Injectable, Logger } from '@nestjs/common';
import { Database } from 'src/db/db.module';
import {
	DbTickerSymbolEarningsNew,
	DbTickerSymbolEarningsUpdate
} from 'src/db/types/tables/tickerSymbolEarnings';
import { TickerSymbolEarnings } from 'src/entities/TickerSymbolEarnings.model';
import { getErrorObject } from 'src/util/errors';

@Injectable()
export class DbTickerSymbolEarningsService {
	private readonly logger = new Logger(DbTickerSymbolEarningsService.name);

	constructor(private db: Database) {}

	/**
	 * Retrieve all ticker symbol earnings records from the database
	 *
	 * @returns Array of TickerSymbolEarnings entity objects
	 */
	async getAll() {
		const records = await this.db
			.selectFrom('ticker_symbol_earnings')
			.orderBy('date asc')
			.selectAll()
			.execute();

		return records.map((record) => TickerSymbolEarnings.fromDbRecord(record));
	}

	/**
	 * Retrieve ticker symbol earnings records from the database for the
	 * specifed ticker symbol IDs
	 *
	 * @param tickerSymbolIds Array of ticker symbol IDs
	 * @returns Array of TickerSymbolEarnings entity objects
	 */
	async getForTickerSymbolIds(tickerSymbolIds: readonly number[]) {
		const records = await this.db
			.selectFrom('ticker_symbol_earnings')
			.where('ticker_symbol_id', 'in', tickerSymbolIds)
			.orderBy('date asc')
			.selectAll()
			.execute();

		return records.map((record) => TickerSymbolEarnings.fromDbRecord(record));
	}

	/**
	 * Retrieve ticker symbol earnings records from the database between the
	 * specified dates
	 *
	 * @param ymdStart Starting date in "YYYY-MM-DD" format
	 * @param ymdEnd Ending date in "YYYY-MM-DD" format
	 * @returns Array of TickerSymbolEarnings entity objects
	 */
	async getBetweenDates(ymdStart: string, ymdEnd: string) {
		const records = await this.db
			.selectFrom('ticker_symbol_earnings')
			.where('date', '>=', ymdStart)
			.where('date', '<=', ymdEnd)
			.orderBy('date asc')
			.selectAll()
			.execute();

		return records.map((record) => TickerSymbolEarnings.fromDbRecord(record));
	}

	/**
	 * Create multiple new ticker symbol earnings records in the database
	 *
	 * @param insertRows Array of DbTickerSymbolEarningsNew objects
	 * @returns The number of records created
	 */
	async createMany(insertRows: DbTickerSymbolEarningsNew[]) {
		if (!insertRows.length) {
			return 0;
		}

		try {
			const insertResult = await this.db
				.insertInto('ticker_symbol_earnings')
				.values(insertRows)
				.executeTakeFirstOrThrow();

			return Number(insertResult.numInsertedOrUpdatedRows);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while creating ticker symbol earnings records'
			);

			this.logger.error({ stack: errObj.stack, insertRows }, errObj.message);

			return 0;
		}
	}

	/**
	 * Update an existing ticker symbol earnings record in the database by its ID
	 *
	 * @param recordId The ticker symbol earnings record ID
	 * @param values The values to update
	 * @returns The updated TickerSymbolEarnings entity object or null if an error occurred
	 */
	async updateById(
		recordId: number | number[],
		values: Omit<DbTickerSymbolEarningsUpdate, 'id' | 'name'>
	) {
		try {
			const updatedRecord = await this.db
				.updateTable('ticker_symbol_earnings')
				.set(values)
				.where('id', Array.isArray(recordId) ? 'in' : '=', recordId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TickerSymbolEarnings.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while updating a ticker symbol earnings record by ID'
			);

			this.logger.error(
				{ stack: errObj.stack, recordId, updateValues: values },
				errObj.message
			);

			return null;
		}
	}
}
