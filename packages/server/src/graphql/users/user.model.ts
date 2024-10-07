import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User as UserEntity } from 'src/entities/User.model';
import EUserRoleType from 'src/enums/EUserRoleType';

@ObjectType({ description: 'user' })
export class User {
	@Field(() => Int)
	id: number;

	@Field()
	username: string;

	@Field()
	displayName: string;

	@Field(() => [String])
	roles: string[];

	@Field()
	active: boolean;

	@Field(() => Date, { nullable: true })
	createdAt: Date | null;

	@Field()
	isAdmin: boolean;

	static fromEntity(entity: UserEntity): User {
		return {
			id: entity.id,
			username: entity.username,
			displayName: entity.displayName,
			roles: entity.roles,
			active: entity.active,
			createdAt: entity.createdAt,
			isAdmin: entity.roles.includes(EUserRoleType.ADMIN)
		};
	}
}
