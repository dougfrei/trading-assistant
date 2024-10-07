import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from 'src/graphql/common/models/pagination.model';
import { ScreenerRecord } from './screenerRecord.model';

@ObjectType({ description: 'paginatedScreenerResults response' })
export class PaginatedScreenerResultsResponse {
	@Field(() => Pagination)
	pagination: Pagination;

	@Field(() => [ScreenerRecord])
	records: ScreenerRecord[];
}
