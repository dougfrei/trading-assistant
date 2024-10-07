import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface RelationTradesToTradeTagsTable {
	id: Generated<number>;
	trade_id: number;
	trade_tag_id: number;
}

export type DbRelationTradesToTradeTags = Selectable<RelationTradesToTradeTagsTable>;
export type DbRelationTradesToTradeTagsNew = Insertable<RelationTradesToTradeTagsTable>;
export type DbRelationTradesToTradeTagsUpdate = Updateable<RelationTradesToTradeTagsTable>;
