import {
	ETradeInstrumentType,
	TTradePosition,
	optionTradePositionSchema,
	stockTradePositionSchema
} from '@trading-assistant/common';
import { DbTrade } from 'src/db/types/tables/trades';
import ITradeNote, { tradeNoteSchema } from 'src/interfaces/ITradeNote';
import ITradePriceLevel, { tradePriceLevelSchema } from 'src/interfaces/ITradePriceLevel';
import * as v from 'valibot';

export class Trade {
	public id: number;
	public userId: number;
	public accountId: number;
	public instrumentType: ETradeInstrumentType;
	public tickerSymbol: string;
	public optionSpreadTemplate: string;
	public positions: TTradePosition[];
	public stopLossLevels: ITradePriceLevel[];
	public profitTargetLevels: ITradePriceLevel[];
	public notes: ITradeNote[];
	public openDateTime: Date | null;
	public closeDateTime: Date | null;

	constructor(params: Partial<Trade> = {}) {
		this.id = params.id ?? 0;
		this.userId = params.userId ?? 0;
		this.accountId = params.accountId ?? 0;
		this.instrumentType = params.instrumentType ?? ETradeInstrumentType.STOCK;
		this.tickerSymbol = params.tickerSymbol ?? '';
		this.optionSpreadTemplate = params.optionSpreadTemplate ?? '';
		this.positions = params.positions ?? [];
		this.stopLossLevels = params.stopLossLevels ?? [];
		this.profitTargetLevels = params.profitTargetLevels ?? [];
		this.notes = params.notes ?? [];
		this.openDateTime = params.openDateTime ?? null;
		this.closeDateTime = params.closeDateTime ?? null;
	}

	static fromDbRecord(data: DbTrade): Trade {
		const instrumentType = data.instrument_type ?? ETradeInstrumentType.STOCK;
		let positions = data.positions ?? [];

		switch (instrumentType) {
			case ETradeInstrumentType.STOCK:
				positions = v.parse(v.array(stockTradePositionSchema), positions);
				break;

			case ETradeInstrumentType.OPTION:
				positions = v.parse(v.array(optionTradePositionSchema), positions);
				break;

			default:
				break;
		}

		return new Trade({
			id: data.id,
			userId: data.user_id,
			accountId: data.account_id,
			instrumentType,
			tickerSymbol: data.ticker_symbol,
			optionSpreadTemplate: data.option_spread_template ?? '',
			positions,
			stopLossLevels: v.parse(v.array(tradePriceLevelSchema), data.stop_loss_levels ?? []),
			profitTargetLevels: v.parse(
				v.array(tradePriceLevelSchema),
				data.profit_target_levels ?? []
			),
			notes: v.parse(v.array(tradeNoteSchema), data.notes ?? []),
			openDateTime: data.open_date_time ?? null,
			closeDateTime: data.close_date_time ?? null
		});
	}
}
