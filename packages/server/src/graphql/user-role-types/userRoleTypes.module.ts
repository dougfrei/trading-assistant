import { Module } from '@nestjs/common';
import { UserRoleTypesResolver } from './userRoleTypes.resolver';

@Module({
	providers: [UserRoleTypesResolver]
})
export default class UserRoleTypesGraphQLModule {}
