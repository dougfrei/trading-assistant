import { DbUsers } from 'src/db/types/tables/users';
import EUserRoleType from 'src/enums/EUserRoleType';

export class User {
	public id: number;
	public username: string;
	public password: string;
	public displayName: string;
	public refreshTokens: string[];
	public roles: string[];
	public active: boolean;
	public activateId: string;
	public createdAt: Date | null;

	constructor(params: Partial<User> = {}) {
		this.id = params.id ?? 0;
		this.username = params.username ?? '';
		this.password = params.password ?? '';
		this.refreshTokens = params.refreshTokens ?? [];
		this.roles = params.roles ?? [];
		this.displayName = params.displayName ?? '';
		this.active = params.active ?? false;
		this.activateId = params.activateId ?? '';
		this.createdAt = params.createdAt ?? null;
	}

	static fromDbRecord(data: DbUsers): User {
		return new User({
			id: data.id,
			username: data.username,
			password: data.password,
			refreshTokens: data.refresh_tokens,
			roles: data.roles,
			displayName: data.display_name,
			active: data.active,
			activateId: data.activate_id,
			createdAt: data.created_at
		});
	}

	toRestApiResponse() {
		return {
			username: this.username,
			displayName: this.displayName,
			isAdmin: this.roles.includes(EUserRoleType.ADMIN)
		};
	}
}
