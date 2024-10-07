import { Field, ObjectType } from '@nestjs/graphql';
// import { TickerSymbol } from 'src/graphql/ticker-symbols/ticker.model';
import { IGCISRecord } from 'src/services/gcisManager.service';

@ObjectType({ description: 'sector' })
export class Sector {
	@Field({ defaultValue: '' })
	gcis: string;

	@Field({ defaultValue: '' })
	name: string;

	// @Field(() => TickerSymbol, { nullable: true })
	// etfTickerSymbol?: TickerSymbol;

	// @Field(() => [TickerSymbol], { nullable: true })
	// tickerSymbols?: TickerSymbol[];

	static fromGCISrecord(gcis: IGCISRecord) {
		const sector = new Sector();

		sector.gcis = gcis.gcis;
		sector.name = gcis.name;

		return sector;
	}
}
