import { ETradeInstrumentType } from '@trading-assistant/common';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface TradeAccountTable {
	id: Generated<number>;
	user_id: number;
	label: string;
	supported_instruments: ETradeInstrumentType[];
}

export type DbTradeAccount = Selectable<TradeAccountTable>;
export type DbTradeAccountNew = Insertable<TradeAccountTable>;
export type DbTradeAccountUpdate = Updateable<TradeAccountTable>;
