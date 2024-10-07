import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from 'src/graphql/common/models/pagination.model';
import { Trade } from 'src/graphql/trades/trade.model';

@ObjectType({ description: 'paginatedTrades response' })
export class PaginatedTradesResponse {
	@Field(() => Pagination)
	pagination: Pagination;

	@Field(() => [Trade])
	records: Trade[];
}
