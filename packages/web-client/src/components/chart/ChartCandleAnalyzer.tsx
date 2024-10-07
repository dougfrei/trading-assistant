import ICandle from '@src/interfaces/ICandle';
import {
	IChartSeriesTypeHistogram,
	IChartSeriesTypeLine,
	IGqlCandleAnalyzerChartType
} from '@src/interfaces/IGqlResponses';
import { getChartTimeFromCandle, getLineStyleForStringValue } from '@src/util/lightweightCharts';
import {
	ColorType,
	CrosshairMode,
	DeepPartial,
	IChartApi,
	ISeriesApi,
	LineWidth,
	TimeChartOptions
} from 'lightweight-charts';
import { useCallback, useMemo } from 'react';
import { IChartColors } from './Chart.interfaces';
import ChartBase from './ChartBase';
import ChartLegend from './ChartLegend';

const ChartCandleAnalyzer: React.FC<{
	candles: ICandle[];
	chartColors: IChartColors;
	chartType: IGqlCandleAnalyzerChartType;
	timeScaleVisible?: boolean;
}> = ({ candles, chartColors, chartType, timeScaleVisible = false }) => {
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
			const seriesObjs: ISeriesApi<'Line' | 'Histogram'>[] = [];

			chartType.seriesItems.forEach((seriesType) => {
				let series: ISeriesApi<'Line' | 'Histogram'> | null = null;

				if (seriesType.type === 'line') {
					const seriesOptions = seriesType.options as IChartSeriesTypeLine;

					series = chart.addLineSeries({
						color: seriesOptions.color ?? 'rgba(255,255,255,75)',
						lineStyle: getLineStyleForStringValue(seriesOptions?.lineStyle ?? 'solid'),
						lineWidth: (seriesOptions?.lineWidth as LineWidth) ?? (1 as LineWidth),
						lastValueVisible: false,
						crosshairMarkerVisible: false,
						priceLineVisible: false,
						priceScaleId: ''
					});
				} else if (seriesType.type === 'histogram') {
					const seriesOptions = seriesType.options as IChartSeriesTypeHistogram;

					series = chart.addHistogramSeries({
						color: seriesOptions.color ?? 'rgba(255,255,255,75)',
						priceFormat: {
							type: seriesOptions.priceFormatType
						}
					});
				}

				if (series) {
					series.setData(
						candles.map((candle) => ({
							time: getChartTimeFromCandle(candle),
							value: candle.indicators[seriesType.indicatorKey] ?? 0
						}))
					);

					if (Array.isArray(seriesType.priceLines)) {
						seriesType.priceLines.forEach((priceLine) => {
							series.createPriceLine({
								price: priceLine.price,
								color: priceLine.color ?? 'rgba(255,255,255,50)',
								lineWidth: (priceLine?.lineWidth ?? 1) as LineWidth,
								axisLabelVisible: priceLine.axisLabelVisible ?? false
							});
						});
					}

					seriesObjs.push(series);
				}
			});

			return seriesObjs;
		},
		[candles]
	);

	return (
		<ChartBase chartOptions={chartOptions} onCreateChart={createChartHandler}>
			<ChartLegend label={chartType.chartLabel} />
		</ChartBase>
	);
};

export default ChartCandleAnalyzer;
