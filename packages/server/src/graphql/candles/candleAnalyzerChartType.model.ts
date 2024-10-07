import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { IChartTypeSeriesItem } from 'src/interfaces/ICandleAnalyzer';

@ObjectType({ description: 'candle analyzer chart type' })
export class CandleAnalyzerChartType {
	@Field()
	chartId: string;

	@Field()
	chartLabel: string;

	@Field(() => GraphQLJSON)
	seriesItems: IChartTypeSeriesItem[];
}
