import { ETradeTagType } from '@trading-assistant/common';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface TradeTagTable {
	id: Generated<number>;
	user_id: number;
	type: ETradeTagType;
	label: string;
}

export type DbTradeTag = Selectable<TradeTagTable>;
export type DbTradeTagNew = Insertable<TradeTagTable>;
export type DbTradeTagUpdate = Updateable<TradeTagTable>;
