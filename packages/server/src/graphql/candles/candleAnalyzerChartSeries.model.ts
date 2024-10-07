import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import {
	IChartSeriesTypeHistogram,
	IChartSeriesTypeLine,
	TSeriesType
} from 'src/interfaces/ICandleAnalyzer';

@ObjectType({ description: 'candle analyzer chart series' })
export class CandleAnalyzerChartSeries {
	@Field()
	valueTypeId: string;

	@Field()
	seriesLabel: string;

	@Field()
	indicatorKey: string;

	@Field(() => String)
	seriesType: TSeriesType;

	@Field(() => GraphQLJSON)
	seriesOptions: IChartSeriesTypeLine | IChartSeriesTypeHistogram;
}
