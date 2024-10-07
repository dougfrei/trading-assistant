import { Module } from '@nestjs/common';
import { TradePerformanceResolver } from './tradePerformance.resolver';

@Module({
	providers: [TradePerformanceResolver]
})
export default class TradePerformanceGraphQLModule {}
