import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'candle analyzer notice type' })
export class CandleAnalyzerNoticeType {
	@Field()
	key: string;

	@Field()
	label: string;
}
