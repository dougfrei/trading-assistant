import { ETickerSymbolType } from '@trading-assistant/common';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { OptionalInsertUpdateColumnType, OptionalInsertUpdateJSONColumnType } from '..';

export interface TickerSymbolTable {
	id: Generated<number>;
	name: string;
	label: string | null;
	avg_daily_vol: OptionalInsertUpdateColumnType<number>;
	market_cap: OptionalInsertUpdateColumnType<bigint>;
	last_price: OptionalInsertUpdateColumnType<number>;
	all_time_high: OptionalInsertUpdateColumnType<number>;
	all_time_low: OptionalInsertUpdateColumnType<number>;
	ttm_high: OptionalInsertUpdateColumnType<number>;
	ttm_low: OptionalInsertUpdateColumnType<number>;
	active: OptionalInsertUpdateColumnType<boolean>;
	gcis: OptionalInsertUpdateColumnType<string>;
	type: ETickerSymbolType;
	truncated_values: OptionalInsertUpdateJSONColumnType<Record<string, number>>;
}

export type DbTickerSymbol = Selectable<TickerSymbolTable>;
export type DbTickerSymbolNew = Insertable<TickerSymbolTable>;
export type DbTickerSymbolUpdate = Updateable<TickerSymbolTable>;
