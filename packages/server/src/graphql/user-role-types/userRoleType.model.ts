import { Field, ObjectType } from '@nestjs/graphql';
import EUserRoleType from 'src/enums/EUserRoleType';

@ObjectType({ description: 'user role type' })
export class UserRoleType {
	@Field()
	name: EUserRoleType;

	@Field()
	label: string;

	@Field()
	description: string;
}
