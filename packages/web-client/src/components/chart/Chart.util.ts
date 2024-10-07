import { DeepPartial, LineStyleOptions, SeriesOptionsCommon } from 'lightweight-charts';
import { IChartColors } from './Chart.interfaces';

export function getDefaultChartColors(): IChartColors {
	return {
		green: '#089A81',
		red: '#F33645',
		volumeGreen: 'rgba(0, 150, 136, 1)',
		volumeRed: 'rgba(255,82,82, 1)',
		background: '#161A25',
		text: 'rgba(255, 255, 255, 0.9)',
		border: 'rgba(197, 203, 206, 0.8)',
		tradeOpen: '#2196f3',
		tradeClose: '#e91e63'
	};
}

export function getDefaultLineParams(
	params: DeepPartial<LineStyleOptions & SeriesOptionsCommon> = {}
): DeepPartial<LineStyleOptions & SeriesOptionsCommon> {
	return {
		color: '#fff',
		lineWidth: 1,
		lastValueVisible: false,
		crosshairMarkerVisible: false,
		priceLineVisible: false,
		priceScaleId: '',
		...params
	};
}
