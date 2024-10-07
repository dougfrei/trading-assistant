import { Query, Resolver } from '@nestjs/graphql';
import { tradeInstruments } from 'src/constants/tradeInstruments';
import { TradeInstrument } from './tradeInstrument.model';

@Resolver(() => TradeInstrument)
export class TradeInstrumentResolver {
	@Query(() => [TradeInstrument])
	async tradeInstruments(): Promise<TradeInstrument[]> {
		return tradeInstruments.map((instObj) => TradeInstrument.fromObject(instObj));
	}
}
