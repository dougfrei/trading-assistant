import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { OptionalInsertUpdateColumnType } from '..';

export interface UsersTable {
	id: Generated<number>;
	username: string;
	password: string;
	display_name: OptionalInsertUpdateColumnType<string>;
	refresh_tokens: OptionalInsertUpdateColumnType<string[], string>;
	roles: OptionalInsertUpdateColumnType<string[], string>;
	active: OptionalInsertUpdateColumnType<boolean>;
	activate_id: OptionalInsertUpdateColumnType<string>;
	created_at: ColumnType<Date, never, never>;
}

export type DbUsers = Selectable<UsersTable>;
export type DbUsersNew = Insertable<UsersTable>;
export type DbUsersUpdate = Updateable<UsersTable>;
