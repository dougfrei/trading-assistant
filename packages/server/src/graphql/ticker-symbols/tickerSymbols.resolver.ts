import { Args, Context, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ECandlePeriodType } from '@trading-assistant/common';
import { GraphQLError } from 'graphql';
import { DirectedOrderByStringReference } from 'kysely/dist/cjs/parser/order-by-parser';
import { ITables } from 'src/db/types';
import { TickerSymbol as TickerSymbolEntity } from 'src/entities/TickerSymbol.model';
import ETickerSymbolsSortMethod from 'src/enums/ETickerSymbolsSortMethod';
import { IDataloaders } from 'src/graphql-dataloader/GQLDataloader.service';
import {
	DbTickerSymbolService,
	IGetTickerSymbolsParams
} from 'src/services/db/dbTickerSymbol.service';
import { GCISManagerService } from 'src/services/gcisManager.service';
import { Candle } from '../candles/candle.model';
import { Sector } from '../sectors/sector.model';
import { TickerSymbolEarnings } from '../ticker-symbol-earnings/tickerSymbolEarnings.model';
import PaginatedTickerSymbolsArgs from './paginatedTickerSymbols.args';
import { PaginatedTickersResponse } from './paginatedTickersResponse.model';
import { TickerSymbol } from './ticker.model';

@Resolver(() => TickerSymbol)
export class TickerSymbolsResolver {
	constructor(
		private readonly dbTickerSymbolService: DbTickerSymbolService,
		private readonly gcisManagerService: GCISManagerService
	) {}

	@Query(() => TickerSymbol, { name: 'tickerSymbol' })
	async getTickerSymbol(
		@Args('id', { type: () => Int, defaultValue: 0 }) id: number,
		@Args('name', { type: () => String, defaultValue: '' }) name: string
	): Promise<TickerSymbol> {
		try {
			let ticker: TickerSymbolEntity | null = null;

			if (id) {
				ticker = await this.dbTickerSymbolService.getTickerSymbolById(id);
			} else if (name.trim()) {
				ticker = await this.dbTickerSymbolService.getTickerSymbolByName(
					name.trim().toUpperCase()
				);
			} else {
				throw new Error('ticker name or ID must be specified');
			}

			if (!ticker) {
				throw new Error('invalid ticker');
			}

			return TickerSymbol.fromEntity(ticker);
		} catch (err: unknown) {
			throw new GraphQLError(
				err instanceof Error && err.message.trim().length
					? err.message.trim()
					: 'An error occurred while retrieving the specified ticker'
			);
		}
	}

	@Query(() => PaginatedTickersResponse)
	async paginatedTickerSymbols(
		@Args() args: PaginatedTickerSymbolsArgs
	): Promise<PaginatedTickersResponse> {
		try {
			const whereArgs: IGetTickerSymbolsParams = {
				active: true
			};

			if (args.search) {
				whereArgs.search = args.search;
			}

			if (args.gcis) {
				whereArgs.gcis = [args.gcis];
			}

			const totalCount =
				await this.dbTickerSymbolService.getTickerSymbolsTotalCount(whereArgs);

			const totalPages = Math.ceil(totalCount / args.perPage);

			if (args.page > totalPages) {
				args.page = totalPages;
			}

			let skip = (args.page - 1) * args.perPage;

			if (skip < 0) {
				skip = 0;
			}

			let sortMethod: DirectedOrderByStringReference<ITables, 'ticker_symbols', object> =
				'name asc';

			switch (args.sort) {
				case ETickerSymbolsSortMethod.MARKET_CAP_ASC:
					sortMethod = 'market_cap asc';
					break;

				case ETickerSymbolsSortMethod.MARKET_CAP_DESC:
					sortMethod = 'market_cap desc';
					break;

				case ETickerSymbolsSortMethod.AVG_DAILY_VOL_ASC:
					sortMethod = 'avg_daily_vol asc';
					break;

				case ETickerSymbolsSortMethod.AVG_DAILY_VOL_DESC:
					sortMethod = 'avg_daily_vol desc';
					break;

				case ETickerSymbolsSortMethod.NAME_DESC:
					sortMethod = 'name desc';
					break;

				case ETickerSymbolsSortMethod.NAME_ASC:
				default:
					sortMethod = 'name asc';
					break;
			}

			const tickerSymbols = await this.dbTickerSymbolService.getTickerSymbols({
				...whereArgs,
				limit: args.perPage,
				offset: skip,
				order: sortMethod
			});

			return {
				pagination: {
					currentPage: args.page,
					totalPages,
					perPage: args.perPage,
					totalRecords: totalCount
				},
				records: tickerSymbols.map((tickerSymbol) => TickerSymbol.fromEntity(tickerSymbol))
			};
		} catch (err: unknown) {
			throw new GraphQLError(
				err instanceof Error && err.message.trim().length
					? err.message.trim()
					: 'An error occurred'
			);
		}
	}

	@Query(() => [TickerSymbol])
	async searchTickerSymbols(
		@Args('query', { type: () => String, nullable: false }) query: string
	): Promise<TickerSymbol[]> {
		try {
			const records = await this.dbTickerSymbolService.getTickerSymbols({
				search: query,
				limit: 5,
				active: true
			});

			return records.map((record) => TickerSymbol.fromEntity(record));
		} catch (err: unknown) {
			throw new GraphQLError(
				err instanceof Error && err.message.trim().length
					? err.message.trim()
					: `No tickers found matching the query "${query}"`
			);
		}
	}

	@ResolveField('earnings', () => [TickerSymbolEarnings])
	async getTickerSymbolEarningsRecord(
		@Parent() tickerSymbol: TickerSymbol,
		// @Context('tickerSymbolEarningsLoader')
		// tickerSymbolEarningsLoader: DataLoader<number, TickerSymbolEarnings>
		@Context() { loaders }: { loaders: IDataloaders }
	) {
		return loaders.tickerSymbolEarningsLoader.load(tickerSymbol.id);
	}

	@ResolveField('sector', () => Sector)
	async getSector(@Parent() tickerSymbol: TickerSymbol) {
		const sector = new Sector();
		const sectorGCIS = this.gcisManagerService.getSector(tickerSymbol.gcis);

		if (sectorGCIS) {
			sector.gcis = sectorGCIS.gcis;
			sector.name = sectorGCIS.name;
		}

		return sector;
	}

	@ResolveField('candles', () => [Candle])
	async getCandles(
		@Parent() tickerSymbol: TickerSymbol,
		@Args('periodType', {
			type: () => ECandlePeriodType,
			defaultValue: ECandlePeriodType.D
		})
		periodType: ECandlePeriodType,
		@Args('periodCount', { type: () => Number, defaultValue: -1 })
		periodCount: number,
		// @Args('order', { type: () => String, defaultValue: 'desc' })
		// order: 'asc' | 'desc',
		@Context() { loaders }: { loaders: IDataloaders }
	) {
		const key = JSON.stringify({
			tickerSymbolId: tickerSymbol.id,
			symbol: tickerSymbol.name,
			periodType,
			periodCount
			// order
		});

		return loaders.tickerSymbolCandlesLoader.load(key);
	}
}
