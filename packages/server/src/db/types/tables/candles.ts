import { ECandlePeriodType } from '@trading-assistant/common';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { OptionalInsertUpdateJSONColumnType } from '..';

export interface CandleTable {
	id: Generated<number>;
	ticker_symbol_id: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	period: Date;
	period_type: ECandlePeriodType;
	indicators: OptionalInsertUpdateJSONColumnType<Record<string, number>>;
	alerts: OptionalInsertUpdateJSONColumnType<string[]>;
	truncated_values: OptionalInsertUpdateJSONColumnType<Record<string, number>>;
}

export type DbCandle = Selectable<CandleTable>;
export type DbCandleNew = Insertable<CandleTable>;
export type DbCandleUpdate = Updateable<CandleTable>;
