import { Field, ObjectType } from '@nestjs/graphql';
import { CandleAnalyzerChartSeries } from './candleAnalyzerChartSeries.model';

@ObjectType({ description: 'candle analyzer chart series group' })
export class CandleAnalyzerChartSeriesGroup {
	@Field()
	groupLabel: string;

	@Field()
	defaultVisible: boolean;

	@Field(() => [CandleAnalyzerChartSeries])
	series: CandleAnalyzerChartSeries[];
}
