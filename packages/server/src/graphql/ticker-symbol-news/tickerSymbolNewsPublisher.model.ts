import { Field, ObjectType } from '@nestjs/graphql';
import { IPolygonNewsItemPublisher } from 'src/data-sources/PolygonClient.interfaces';

@ObjectType({ description: 'Ticker symbol news publisher record' })
export class TickerSymbolNewsPublisher {
	@Field()
	name: string;

	@Field()
	homepageURL: string;

	@Field()
	logoURL: string;

	@Field()
	faviconURL: string;

	static fromPolygonObject(obj: IPolygonNewsItemPublisher): TickerSymbolNewsPublisher {
		return {
			name: obj.name,
			homepageURL: obj.homepage_url,
			logoURL: obj.logo_url,
			faviconURL: obj.favicon_url
		};
	}
}
