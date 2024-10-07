import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'candle analyzer alert type' })
export class CandleAnalyzerAlertType {
	@Field()
	key: string;

	@Field()
	label: string;

	@Field()
	sentiment: string;
}
