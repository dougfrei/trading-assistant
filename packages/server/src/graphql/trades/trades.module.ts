import { Module } from '@nestjs/common';
import { TradesService } from 'src/services/trades.service';
import { TradesResolver } from './trades.resolver';

@Module({
	providers: [TradesResolver, TradesService]
})
export default class TradesGraphQLModule {}
