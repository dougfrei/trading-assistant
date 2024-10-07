import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from 'src/graphql/common/models/pagination.model';
import { User } from 'src/graphql/users/user.model';

@ObjectType({ description: 'get users response' })
export class GetUsersResponse {
	@Field(() => Pagination)
	pagination: Pagination;

	@Field(() => [User])
	records: User[];
}
