import { EAVWAPType } from '@trading-assistant/common';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface TickerSymbolAVWAPTable {
	id: Generated<number>;
	ticker_symbol_id: number;
	start_candle_id: number;
	type: EAVWAPType;
}

export type DbTickerSymbolAVWAP = Selectable<TickerSymbolAVWAPTable>;
export type DbTickerSymbolAVWAPNew = Insertable<TickerSymbolAVWAPTable>;
export type DbTickerSymbolAVWAPUpdate = Updateable<TickerSymbolAVWAPTable>;
