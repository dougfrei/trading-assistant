import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';

@Module({
	providers: [UsersResolver]
})
export default class UsersGraphQLModule {}
