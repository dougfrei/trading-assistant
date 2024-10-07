import ICandle from '@src/interfaces/ICandle';
import { getChartTimeFromCandle } from '@src/util/lightweightCharts';
import {
	ColorType,
	CrosshairMode,
	DeepPartial,
	IChartApi,
	LineStyle,
	TimeChartOptions
} from 'lightweight-charts';
import { useCallback, useMemo } from 'react';
import { IChartColors } from './Chart.interfaces';
import ChartBase from './ChartBase';
import ChartLegend from './ChartLegend';

const ChartVolume: React.FC<{
	candles: ICandle[];
	chartColors: IChartColors;
	timeScaleVisible?: boolean;
	volumeSMAindicatorKey?: string;
}> = ({ candles, chartColors, timeScaleVisible = false, volumeSMAindicatorKey = 'vol_sma' }) => {
	const chartOptions: DeepPartial<TimeChartOptions> = useMemo(
		() => ({
			height: 150,
			autoSize: false,
			layout: {
				background: {
					type: ColorType.Solid,
					color: chartColors.background
				},
				textColor: chartColors.text
			},
			grid: {
				vertLines: {
					visible: false
				},
				horzLines: {
					visible: false
				}
			},
			crosshair: {
				mode: CrosshairMode.Normal
			},
			rightPriceScale: {
				borderColor: chartColors.border,
				minimumWidth: 70
			},
			timeScale: {
				visible: timeScaleVisible,
				borderVisible: timeScaleVisible,
				borderColor: chartColors.border,
				// timeVisible: true,
				rightOffset: 20
			}
		}),
		[chartColors, timeScaleVisible]
	);

	const createChartHandler = useCallback(
		(chart: IChartApi) => {
			const seriesObjs = [];

			const volumeSeries = chart.addHistogramSeries({
				color: '#26a69a',
				priceFormat: {
					type: 'volume'
				},
				priceScaleId: '',
				// scaleMargins: {
				// 	top: 0.8,
				// 	bottom: 0
				// },
				lastValueVisible: false,
				priceLineVisible: false
			});

			const volumeSeriesData = candles.map((candle) => ({
				time: getChartTimeFromCandle(candle),
				value: candle.volume,
				color: candle.close > candle.open ? chartColors.volumeGreen : chartColors.volumeRed
			}));

			volumeSeries.setData(volumeSeriesData);

			seriesObjs.push(volumeSeries);

			if (
				candles.length &&
				typeof candles[0].indicators[volumeSMAindicatorKey] !== 'undefined'
			) {
				const avgVolSeries = chart.addLineSeries({
					color: 'rgba(255,255,255,75)',
					lineStyle: LineStyle.Dashed,
					lineWidth: 1,
					lastValueVisible: false,
					crosshairMarkerVisible: false,
					priceLineVisible: false,
					priceScaleId: ''
				});

				avgVolSeries.setData(
					candles.map((candle) => ({
						time: getChartTimeFromCandle(candle),
						value: candle.indicators[volumeSMAindicatorKey] ?? 0
					}))
				);

				seriesObjs.push(avgVolSeries);
			}

			return seriesObjs;
		},
		[candles]
	);

	return (
		<ChartBase chartOptions={chartOptions} onCreateChart={createChartHandler}>
			<ChartLegend label="Volume" />
		</ChartBase>
	);
};

export default ChartVolume;
