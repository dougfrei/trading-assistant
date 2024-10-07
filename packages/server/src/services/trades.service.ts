import { Injectable } from '@nestjs/common';
import { ETradeNoteType, TTradePosition } from '@trading-assistant/common';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { nanoid } from 'nanoid';
import { DbTradeNew, DbTradeUpdate } from 'src/db/types/tables/trades';
import ITradeNote, { tradeNoteSchema } from 'src/interfaces/ITradeNote';
import ITradePriceLevel, { tradePriceLevelSchema } from 'src/interfaces/ITradePriceLevel';
import { DbTradeService } from 'src/services/db/dbTrade.service';
import { DbTradeTagService } from 'src/services/db/dbTradeTag.service';
import { isTradeAllSettled } from 'src/util/trade-positions';
import * as v from 'valibot';

export interface ICreateNewTradeParams {
	userId: number;
	accountId: number;
	instrumentType: ETradeInstrumentType;
	tickerSymbol: string;
	positions: TTradePosition[];
	optionSpreadTemplate?: string;
	stopLossLevels?: ITradePriceLevel[];
	profitTargetLevels?: ITradePriceLevel[];
	notes?: string | ITradeNote[];
	tagIds?: number[];
}

export type TUpdateTradeParams = Partial<ICreateNewTradeParams>;

@Injectable()
export class TradesService {
	constructor(
		private readonly dbTradeService: DbTradeService,
		private readonly dbTradeTagService: DbTradeTagService
	) {}

	/**
	 * Create a new trade record
	 *
	 * @param param The trade parameters
	 * @returns A Trade object or null if an error occurred
	 */
	async createNewTrade({
		userId,
		accountId,
		instrumentType,
		tickerSymbol,
		positions,
		optionSpreadTemplate = '',
		stopLossLevels = [],
		profitTargetLevels = [],
		notes = '',
		tagIds = []
	}: ICreateNewTradeParams) {
		const createArgs: DbTradeNew = {
			user_id: userId,
			account_id: accountId,
			instrument_type: instrumentType,
			ticker_symbol: tickerSymbol,
			option_spread_template: optionSpreadTemplate,
			positions: JSON.stringify(positions),
			stop_loss_levels: JSON.stringify(
				v.parse(v.array(tradePriceLevelSchema), stopLossLevels)
			),
			profit_target_levels: JSON.stringify(
				v.parse(v.array(tradePriceLevelSchema), profitTargetLevels)
			)
		};

		if (Array.isArray(notes)) {
			const validatedNotes = v.parse(v.array(tradeNoteSchema), notes);

			createArgs.notes = JSON.stringify(validatedNotes);
		} else if (notes.trim()) {
			const noteObjs: ITradeNote[] = [
				{
					id: nanoid(),
					timestamp: new Date().getTime(),
					content: notes.trim(),
					type: ETradeNoteType.SETUP
				}
			];

			createArgs.notes = JSON.stringify(noteObjs);
		}

		if (positions.length) {
			createArgs.open_date_time = new Date(positions[0].dateTime);

			const lastPosition = positions.at(-1);

			if (
				positions.length > 1 &&
				isTradeAllSettled(instrumentType, positions) &&
				lastPosition
			) {
				createArgs.close_date_time = new Date(lastPosition.dateTime);
			}
		}

		const newTrade = await this.dbTradeService.createTrade(createArgs);

		if (newTrade) {
			await this.dbTradeTagService.setTagIdsForTradeId(newTrade.id, tagIds);
		}

		return newTrade;
	}

	/**
	 * Update an existing trade record
	 *
	 * @param tradeId The trade ID to update
	 * @param userId The user ID used to validate ownership of the trade
	 * @param params The update parameters
	 * @returns A Trade object or null if an error occurred
	 */
	async updateTrade(tradeId: number, userId: number, params: TUpdateTradeParams) {
		const existingRecord = await this.dbTradeService.getTradeById(tradeId, userId);
		const updateValues: DbTradeUpdate = {};

		if (!existingRecord) {
			return null;
		}

		if (typeof params.accountId !== 'undefined') {
			updateValues.account_id = params.accountId;
		}

		// TODO: Should changing the instrumentType be allowed? It would require re-setting the positions.
		if (typeof params.instrumentType !== 'undefined') {
			updateValues.instrument_type = params.instrumentType;
		}

		if (typeof params.tickerSymbol !== 'undefined') {
			updateValues.ticker_symbol = params.tickerSymbol;
		}

		if (typeof params.positions !== 'undefined') {
			updateValues.positions = JSON.stringify(params.positions);

			if (params.positions.length) {
				updateValues.open_date_time = new Date(params.positions[0].dateTime);

				const lastPosition = params.positions.at(-1);

				if (
					params.positions.length > 1 &&
					isTradeAllSettled(existingRecord.instrumentType, params.positions) &&
					lastPosition
				) {
					updateValues.close_date_time = new Date(lastPosition.dateTime);
				}
			}
		}

		if (typeof params.optionSpreadTemplate !== 'undefined') {
			updateValues.option_spread_template = params.optionSpreadTemplate;
		}

		if (typeof params.stopLossLevels !== 'undefined') {
			updateValues.stop_loss_levels = JSON.stringify(
				v.parse(v.array(tradePriceLevelSchema), params.stopLossLevels)
			);
		}

		if (typeof params.profitTargetLevels !== 'undefined') {
			updateValues.profit_target_levels = JSON.stringify(
				v.parse(v.array(tradePriceLevelSchema), params.profitTargetLevels)
			);
		}

		if (typeof params.notes !== 'undefined' && Array.isArray(params.notes)) {
			updateValues.notes = JSON.stringify(v.parse(v.array(tradeNoteSchema), params.notes));
		}

		if (typeof params.tagIds !== 'undefined') {
			await this.dbTradeTagService.setTagIdsForTradeId(tradeId, params.tagIds);
			await this.dbTradeTagService.deleteUnusedTagsIdsForTradeId(tradeId, params.tagIds);
		}

		const updatedTrade = await this.dbTradeService.updateTradeById(
			tradeId,
			userId,
			updateValues
		);

		return updatedTrade;
	}
}
