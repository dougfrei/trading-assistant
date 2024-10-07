import { Args, Query, Resolver } from '@nestjs/graphql';
import PolygonClientService from 'src/data-sources/PolygonClient.service';
import { DEFAULT_MARKET_TICKER_SYMBOL } from 'src/util/constants';
import { TickerSymbolNews } from './tickerSymbolNews.model';

@Resolver(() => TickerSymbolNews)
export class TickerSymbolNewsResolver {
	constructor(private readonly polygonClientService: PolygonClientService) {}

	@Query(() => [TickerSymbolNews], { name: 'tickerSymbolNews' })
	async getTickerSymbolNews(
		@Args({
			name: 'tickerSymbol',
			type: () => String,
			defaultValue: DEFAULT_MARKET_TICKER_SYMBOL
		})
		tickerSymbol: string
	): Promise<TickerSymbolNews[]> {
		const records = await this.polygonClientService.getTickerSymbolNews(tickerSymbol);

		return records.map((record) => TickerSymbolNews.fromPolygonObject(record));
	}
}
