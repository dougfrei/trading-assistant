export interface ICandleAnalyzerIndicatorType {
	key: string;
	label: string;
}

export enum ECandleAnalyzerAlertSentiment {
	BULLISH = 'bullish',
	BEARISH = 'bearish',
	NEUTRAL = 'neutral'
}

export interface ICandleAnalyzerAlertType {
	key: string;
	label: string;
	sentiment: ECandleAnalyzerAlertSentiment;
}

export interface IChartSeriesTypeLine {
	lineStyle?: 'solid' | 'dotted' | 'dashed' | 'large-dashed' | 'sparse-dotted';
	lineWidth?: number;
	color?: string;
}

export interface IChartSeriesTypeHistogram {
	priceFormatType?: 'price' | 'percent' | 'volume';
	color?: string;
}

export type TSeriesType = 'line' | 'histogram';

export interface ICandleAnalyzerChartSeries {
	valueTypeId: string;
	seriesLabel: string;
	indicatorKey: string;
	seriesType: TSeriesType;
	seriesOptions: IChartSeriesTypeLine | IChartSeriesTypeHistogram;
}

export interface ICandleAnalyzerChartSeriesGroup {
	groupLabel: string;
	defaultVisible?: boolean;
	series: ICandleAnalyzerChartSeries[];
}

export interface IChartTypeSeriesItem {
	label: string;
	indicatorKey: string;
	type: TSeriesType;
	options: IChartSeriesTypeLine | IChartSeriesTypeHistogram;
	priceLines?: IChartPriceLine[];
}

export interface IChartPriceLine {
	price: number;
	color?: string;
	lineWidth?: number;
	axisLabelVisible?: boolean;
}

export interface ICandleAnalyzerChartType {
	chartId: string;
	chartLabel: string;
	seriesItems: IChartTypeSeriesItem[];
}
