import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { OptionalInsertUpdateColumnType } from '..';

export interface NYSEMarketHolidaysTable {
	id: Generated<number>;
	date: ColumnType<string, string, string | undefined>;
	is_early_close: OptionalInsertUpdateColumnType<boolean>;
}

export type DbNYSEMarketHolidays = Selectable<NYSEMarketHolidaysTable>;
export type DbNYSEMarketHolidaysNew = Insertable<NYSEMarketHolidaysTable>;
export type DbNYSEMarketHolidaysUpdate = Updateable<NYSEMarketHolidaysTable>;
