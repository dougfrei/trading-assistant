import { ISeriesApi } from 'lightweight-charts';

export interface IChartColors {
	green: string;
	red: string;
	volumeGreen: string;
	volumeRed: string;
	background: string;
	text: string;
	border: string;
	tradeOpen: string;
	tradeClose: string;
}

export type TISeriesApiAny = ISeriesApi<
	'Area' | 'Bar' | 'Baseline' | 'Candlestick' | 'Custom' | 'Histogram' | 'Line'
>;
