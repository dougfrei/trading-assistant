import { Field, ObjectType } from '@nestjs/graphql';
import { IPolygonNewsItemInsight } from 'src/data-sources/PolygonClient.interfaces';

@ObjectType({ description: 'Ticker symbol news insight record' })
export class TickerSymbolNewsInsight {
	@Field()
	ticker: string;

	@Field()
	sentiment: string;

	@Field()
	sentimentReasoning: string;

	static fromPolygonObject(obj: IPolygonNewsItemInsight): TickerSymbolNewsInsight {
		return {
			ticker: obj.ticker,
			sentiment: obj.sentiment,
			sentimentReasoning: obj.sentiment_reasoning
		};
	}
}
