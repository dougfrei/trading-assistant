import { Query, Resolver } from '@nestjs/graphql';
import EUserRoleType from 'src/enums/EUserRoleType';
import { UserRoleType } from './userRoleType.model';

@Resolver(() => UserRoleType)
export class UserRoleTypesResolver {
	@Query(() => [UserRoleType], { name: 'userRoleTypes' })
	userRoleTypes(): UserRoleType[] {
		return [
			{
				name: EUserRoleType.ADMIN,
				label: 'Administrator',
				description: 'Administrators have access to manage data and users'
			}
		];
	}
}
