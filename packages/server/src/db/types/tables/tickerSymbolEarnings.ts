import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { OptionalInsertUpdateColumnType } from '..';

export interface TickerSymbolEarningsTable {
	id: Generated<number>;
	ticker_symbol_id: number;
	date: ColumnType<string, string, string | undefined>;
	after_close: OptionalInsertUpdateColumnType<boolean>;
	eps: number | null;
	esp_estimated: number | null;
	revenue: bigint | null;
	revenue_estimated: bigint | null;
	fiscal_date_ending: ColumnType<string | null, string | undefined, string | undefined>;
}

export type DbTickerSymbolEarnings = Selectable<TickerSymbolEarningsTable>;
export type DbTickerSymbolEarningsNew = Insertable<TickerSymbolEarningsTable>;
export type DbTickerSymbolEarningsUpdate = Updateable<TickerSymbolEarningsTable>;
