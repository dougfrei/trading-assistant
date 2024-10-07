import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { OptionalInsertUpdateColumnType } from '..';

export interface TickerSymbolSplitsTable {
	id: Generated<number>;
	ticker_symbol_id: number;
	date: ColumnType<string, string, string | undefined>;
	from_value: number;
	to_value: number;
	candles_updated: OptionalInsertUpdateColumnType<boolean>;
}

export type DbTickerSymbolSplit = Selectable<TickerSymbolSplitsTable>;
export type DbTickerSymbolSplitNew = Insertable<TickerSymbolSplitsTable>;
export type DbTickerSymbolSplitUpdate = Updateable<TickerSymbolSplitsTable>;
