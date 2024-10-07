import { Module } from '@nestjs/common';
import { TradeInstrumentResolver } from './tradeInstrument.resolver';

@Module({
	providers: [TradeInstrumentResolver]
})
export default class TradeInstrumentGraphQLModule {}
