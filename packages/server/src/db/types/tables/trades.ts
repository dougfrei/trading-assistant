import { ETradeInstrumentType, TTradePosition } from '@trading-assistant/common';
import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import ITradeNote from 'src/interfaces/ITradeNote';
import ITradePriceLevel from 'src/interfaces/ITradePriceLevel';
import { OptionalInsertUpdateJSONColumnType } from '..';

export interface TradeTable {
	id: Generated<number>;
	user_id: number;
	account_id: number;
	instrument_type: ETradeInstrumentType;
	ticker_symbol: string;
	option_spread_template: string;
	positions: OptionalInsertUpdateJSONColumnType<TTradePosition[]>;
	stop_loss_levels: OptionalInsertUpdateJSONColumnType<ITradePriceLevel[]>;
	profit_target_levels: OptionalInsertUpdateJSONColumnType<ITradePriceLevel[]>;
	notes: OptionalInsertUpdateJSONColumnType<ITradeNote[]>;
	open_date_time: ColumnType<Date | undefined, Date | undefined, Date | undefined>;
	close_date_time: ColumnType<Date | undefined, Date | undefined, Date | undefined>;
}

export type DbTrade = Selectable<TradeTable>;
export type DbTradeNew = Insertable<TradeTable>;
export type DbTradeUpdate = Updateable<TradeTable>;
