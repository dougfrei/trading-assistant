import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from 'src/graphql/common/models/pagination.model';
import { TickerSymbol } from 'src/graphql/ticker-symbols/ticker.model';

@ObjectType({ description: 'paginatedTickers response' })
export class PaginatedTickersResponse {
	@Field(() => Pagination)
	pagination: Pagination;

	@Field(() => [TickerSymbol])
	records: TickerSymbol[];
}
