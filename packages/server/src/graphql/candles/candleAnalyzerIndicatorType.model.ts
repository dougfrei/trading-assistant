import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'candle analyzer indicator type' })
export class CandleAnalyzerIndicatorType {
	@Field()
	key: string;

	@Field()
	label: string;
}
