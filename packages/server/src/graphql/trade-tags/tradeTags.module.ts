import { Module } from '@nestjs/common';
import { TradeTagsResolver } from './tradeTags.resolver';

@Module({
	providers: [TradeTagsResolver]
})
export default class TradeTagsGraphQLModule {}
