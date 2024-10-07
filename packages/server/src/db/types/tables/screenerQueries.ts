import { IScreenerQueryLogicRoot } from '@trading-assistant/common';
import { Generated, Insertable, JSONColumnType, Selectable, Updateable } from 'kysely';

export interface ScreenerQueryTable {
	id: Generated<number>;
	label: string;
	description: string | undefined;
	query: JSONColumnType<IScreenerQueryLogicRoot>;
}

export type DbScreenerQuery = Selectable<ScreenerQueryTable>;
export type DbScreenerQueryNew = Insertable<ScreenerQueryTable>;
export type DbScreenerQueryUpdate = Updateable<ScreenerQueryTable>;
