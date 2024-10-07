import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'pagination' })
export class Pagination {
	@Field(() => Int)
	currentPage: number;

	@Field(() => Int)
	totalPages: number;

	@Field(() => Int)
	perPage: number;

	@Field(() => Int)
	totalRecords: number;
}
