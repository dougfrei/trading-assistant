import { Field, ObjectType } from '@nestjs/graphql';
import { IPolygonNewsItem } from 'src/data-sources/PolygonClient.interfaces';
import { TickerSymbolNewsInsight } from './tickerSymbolNewsInsight.model';
import { TickerSymbolNewsPublisher } from './tickerSymbolNewsPublisher.model';

@ObjectType({ description: 'Ticker symbol news record' })
export class TickerSymbolNews {
	@Field()
	id: string;

	@Field(() => TickerSymbolNewsPublisher)
	publisher: TickerSymbolNewsPublisher;

	@Field()
	title: string;

	@Field()
	author: string;

	@Field()
	publishedUTC: string;

	@Field()
	articleURL: string;

	@Field(() => [String])
	tickers: string[];

	@Field()
	imageURL: string;

	@Field()
	description: string;

	@Field(() => [String])
	keywords: string[];

	@Field(() => [TickerSymbolNewsInsight])
	insights: TickerSymbolNewsInsight[];

	static fromPolygonObject(obj: IPolygonNewsItem): TickerSymbolNews {
		return {
			id: obj.id,
			publisher: TickerSymbolNewsPublisher.fromPolygonObject(obj.publisher),
			title: obj.title,
			author: obj.author,
			publishedUTC: obj.published_utc,
			articleURL: obj.article_url,
			tickers: obj.tickers,
			imageURL: obj.image_url,
			description: obj.description,
			keywords: obj.keywords,
			insights: obj.insights.map((insight) =>
				TickerSymbolNewsInsight.fromPolygonObject(insight)
			)
		};
	}
}
