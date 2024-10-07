import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'candle analyzer render line type' })
export class CandleAnalyzerRenderLineType {
	@Field()
	group: string;

	@Field()
	indicatorKey: string;

	@Field({ defaultValue: '' })
	label?: string;

	@Field({ defaultValue: '#FFFFFF' })
	color?: string;
}
