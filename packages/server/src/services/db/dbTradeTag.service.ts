import { Injectable, Logger } from '@nestjs/common';
import { ETradeTagType } from '@trading-assistant/common';
import { DirectedOrderByStringReference } from 'kysely/dist/cjs/parser/order-by-parser';
import { Database } from 'src/db/db.module';
import { ITables } from 'src/db/types';
import { DbRelationTradesToTradeTagsNew } from 'src/db/types/tables/relationTradesToTradeTags';
import { DbTradeTagNew, DbTradeTagUpdate } from 'src/db/types/tables/tradeTags';
import { TradeTag } from 'src/entities/TradeTag.model';
import { getErrorObject } from 'src/util/errors';

export interface IGetTradeTagsParams {
	userId?: number;
	type?: ETradeTagType;
	order?: DirectedOrderByStringReference<ITables, 'trade_tags', object>;
	limit?: number;
	offset?: number;
}

@Injectable()
export class DbTradeTagService {
	private readonly logger = new Logger(DbTradeTagService.name);

	constructor(private db: Database) {}

	/**
	 * Return an array of TradeTag entities
	 *
	 * @param params Filter parameters for the query
	 * @returns An array of TradeTag entities
	 */
	async getTradeTags(params: IGetTradeTagsParams = {}) {
		let query = this.db.selectFrom('trade_tags');

		if (typeof params.userId !== 'undefined') {
			query = query.where('user_id', '=', params.userId);
		}

		if (typeof params.type !== 'undefined') {
			query = query.where('type', '=', params.type);
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

		return records.map((record) => TradeTag.fromDbRecord(record));
	}

	/**
	 * Get TradeTag entities for multiple trade ids. A map with trade id keys
	 * containing arrays of TradeTag entities will be returned.
	 *
	 * @param tradeIds An array of trade ids
	 * @param tagType An optional trade tag type to limit the type of records returned
	 * @returns A map with trade id keys containing arrays of TradeTag entities
	 */
	async getTradeTagsForTradeIds(tradeIds: number[], tagType?: ETradeTagType) {
		let query = this.db
			.selectFrom('_relation_trades_to_trade_tags')
			.innerJoin('trade_tags', 'trade_tags.id', '_relation_trades_to_trade_tags.trade_tag_id')
			.where('_relation_trades_to_trade_tags.trade_id', 'in', tradeIds);

		if (typeof tagType !== 'undefined') {
			query = query.where('trade_tags.type', '=', tagType);
		}

		const records = await query
			.select([
				'trade_id',
				'trade_tags.id',
				'trade_tags.user_id',
				'trade_tags.label',
				'trade_tags.type'
			])
			.execute();

		const tagsByTradeId = tradeIds.reduce((acum, tradeId) => {
			acum.set(
				tradeId,
				records
					.filter((record) => record.trade_id === tradeId)
					.map((record) => TradeTag.fromDbRecord(record))
			);

			return acum;
		}, new Map<number, TradeTag[]>());

		return tagsByTradeId;
	}

	/**
	 * Create a new trade tag
	 *
	 * @param values Values for the new trade tag
	 * @returns A new TradeTag entity, or null if not successful
	 */
	async createTradeTag(values: Omit<DbTradeTagNew, 'id'>): Promise<TradeTag | null> {
		try {
			const newRecord = await this.db
				.insertInto('trade_tags')
				.values(values)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TradeTag.fromDbRecord(newRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while creating a trade tag record'
			);

			this.logger.error({ stack: errObj.stack, createValues: values }, errObj.message);

			return null;
		}
	}

	/**
	 * Set the tag IDs used by the specfied trade by creating records in the
	 * trades to trade tags relation table
	 *
	 * @param tradeId The trade ID
	 * @param tagIds The tag IDs to associate with the trade ID
	 * @returns The number of association rows created
	 */
	async setTagIdsForTradeId(tradeId: number, tagIds: number[]) {
		const values: DbRelationTradesToTradeTagsNew[] = tagIds.map((tagId) => ({
			trade_id: tradeId,
			trade_tag_id: tagId
		}));

		try {
			const insertRes = await this.db
				.insertInto('_relation_trades_to_trade_tags')
				.values(values)
				.executeTakeFirstOrThrow();

			return Number(insertRes.numInsertedOrUpdatedRows);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while while setting the tags IDs for a trade record'
			);

			this.logger.error({ stack: errObj.stack, tradeId, tagIds }, errObj.message);

			return 0;
		}
	}

	/**
	 * Remove any unused rows in the trades to trade tags relation table that are
	 * not included in the specified current tag IDs
	 *
	 * @param tradeId The trade ID
	 * @param currentTagIds An array of currently used trade tag IDs by the trade
	 * @returns The number of association rows deleted
	 */
	async deleteUnusedTagsIdsForTradeId(tradeId: number, currentTagIds: number[]) {
		try {
			const deleteRes = await this.db
				.deleteFrom('_relation_trades_to_trade_tags')
				.where('trade_id', '=', tradeId)
				.where('trade_tag_id', 'not in', currentTagIds)
				.executeTakeFirstOrThrow();

			return Number(deleteRes.numDeletedRows);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred deleting unused tag IDs for a trade record'
			);

			this.logger.error({ stack: errObj.stack, tradeId, currentTagIds }, errObj.message);

			return 0;
		}
	}

	/**
	 * Update trade tag values for specified trade tag ID. A user ID is required
	 * to ensure the trade tag record belongs to the correct user.
	 *
	 * @param tagId The trade tag ID
	 * @param userId The user ID that should be associated with the trade tag
	 * @param values The updated trade tag values
	 * @returns The updated TradeTag entity or null if not successful
	 */
	async updateTradeTagById(tagId: number, userId: number, values: DbTradeTagUpdate) {
		try {
			const updatedRecord = await this.db
				.updateTable('trade_tags')
				.set(values)
				.where('id', '=', tagId)
				.where('user_id', '=', userId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TradeTag.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while updating a trade tag record by ID'
			);

			this.logger.error({ stack: errObj.stack, tagId, updateValues: values }, errObj.message);

			return null;
		}
	}

	/**
	 * Delete a trade tag record by its ID. A user ID is required to ensure the
	 * trade tag record belongs to the correct user.
	 *
	 * @param tagId The trade tag ID
	 * @param userId The user ID that should be associated with the trade tag
	 * @returns TradeTag entity for the deleted record or null if not successful
	 */
	async deleteTradeTagById(tagId: number, userId: number) {
		try {
			const deletedRecord = await this.db
				.deleteFrom('trade_tags')
				.where('id', '=', tagId)
				.where('user_id', '=', userId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return TradeTag.fromDbRecord(deletedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while deleting a trade tag record by ID'
			);

			this.logger.error({ stack: errObj.stack, tagId }, errObj.message);

			return null;
		}
	}
}
