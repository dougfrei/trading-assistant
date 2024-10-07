import { Module } from '@nestjs/common';
import { TradeOptionSpreadTemplateGroupResolver } from './tradeOptionSpreadTemplateGroups.resolver';

@Module({
	providers: [TradeOptionSpreadTemplateGroupResolver]
})
export default class TradeOptionSpreadTemplatesGraphQLModule {}
