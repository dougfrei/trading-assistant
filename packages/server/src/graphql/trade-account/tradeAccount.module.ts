import { Module } from '@nestjs/common';
import { TradeAccountResolver } from './tradeAccount.resolver';

@Module({
	providers: [TradeAccountResolver]
})
export default class TradeAccountGraphQLModule {}
