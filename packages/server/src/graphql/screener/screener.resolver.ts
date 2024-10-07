import { Args, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import EScreenerSortMethod from 'src/enums/EScreenerSortMethod';
import { Candle } from 'src/graphql/candles/candle.model';
import { TickerSymbol } from 'src/graphql/ticker-symbols/ticker.model';
import { DbScreenerQueryService } from 'src/services/db/dbScreenerQuery.service';
import { ScreenerService } from 'src/services/screener.service';
import { PaginatedScreenerResultsResponse } from './paginatedScreenerResults.model';
import { ScreenerQuery } from './screenerQuery.model';
import { ScreenerRecord } from './screenerRecord.model';
import ScreenerRecordsArgs from './screenerRecords.args';
import { ScreenerSortMethod } from './screenerSortMethod.model';

@Resolver(() => ScreenerRecord)
export class ScreenerResolver {
	constructor(
		private readonly screenerService: ScreenerService,
		private readonly dbScreenerQueryService: DbScreenerQueryService
	) {}

	@Query(() => PaginatedScreenerResultsResponse)
	async paginatedScreenerResults(
		@Args() args: ScreenerRecordsArgs
	): Promise<PaginatedScreenerResultsResponse> {
		try {
			const results = await this.screenerService.getScreenerResults({
				periodType: args.periodType,
				page: args.page,
				perPage: args.perPage,
				sort: args.sort,
				sectorGCIS: args.sectorGCIS,
				queryId: args.queryId
			});

			return {
				pagination: {
					currentPage: results.pagination.currentPage,
					totalPages: results.pagination.totalPages,
					perPage: results.pagination.perPage,
					totalRecords: results.pagination.totalRecords
				},
				records: results.results.map((result) => ({
					tickerSymbol: TickerSymbol.fromEntity(result.tickerSymbol),
					lastCandle: Candle.fromEntity(result.lastCandle),
					meta: {
						change: result.meta.change
					}
				}))
			};
		} catch (err: unknown) {
			throw new GraphQLError(err instanceof Error ? err.message : 'An error occurred');
		}
	}

	@Query(() => [ScreenerSortMethod])
	screenerSortMethods(): ScreenerSortMethod[] {
		return [
			{ name: EScreenerSortMethod.TICKER, label: 'Ticker' },
			{ name: EScreenerSortMethod.AVG_DAILY_VOL_ASC, label: 'Average Daily Volume Asc' },
			{ name: EScreenerSortMethod.AVG_DAILY_VOL_DESC, label: 'Average Daily Volume Desc' }
		];
	}

	@Query(() => [ScreenerQuery])
	async screenerQueries(): Promise<ScreenerQuery[]> {
		const records = await this.dbScreenerQueryService.getScreenerQueries({
			order: 'label asc'
		});

		return records.map((record) => ScreenerQuery.fromEntity(record));
	}
}
