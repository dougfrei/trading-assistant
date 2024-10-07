import ICandle from '@src/interfaces/ICandle';
import {
	IChartSeriesTypeHistogram,
	IChartSeriesTypeLine,
	IGqlCandleAnalyzerChartSeriesGroup
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
import { useCallback, useMemo, useRef } from 'react';
import { IChartColors } from './Chart.interfaces';
import ChartBase from './ChartBase';
import ChartLegend from './ChartLegend';

type TValidSeriesApi = ISeriesApi<'Candlestick' | 'Line' | 'Histogram'>;

const ChartCandles: React.FC<{
	candles: ICandle[];
	chartColors: IChartColors;
	timeScaleVisible?: boolean;
	heikinAshiView?: boolean;
	chartSeriesGroups?: IGqlCandleAnalyzerChartSeriesGroup[];
	tickerName?: string;
	tickerLabel?: string;
}> = ({
	candles,
	chartColors,
	timeScaleVisible = false,
	heikinAshiView = false,
	chartSeriesGroups = [],
	tickerName = '',
	tickerLabel = ''
}) => {
	const seriesObjectsByGroup = useRef<
		Record<string, { visible: boolean; series: TValidSeriesApi[] }>
	>({});

	const chartOptions: DeepPartial<TimeChartOptions> = useMemo(
		() => ({
			// width: 1000,
			autoSize: false,
			height: 300,
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
			seriesObjectsByGroup.current = {};

			let allSeriesObjects: TValidSeriesApi[] = [];

			const candleSeriesRef = chart.addCandlestickSeries({
				upColor: chartColors.green,
				downColor: chartColors.red,
				wickUpColor: chartColors.green,
				wickDownColor: chartColors.red,
				borderVisible: false,
				priceScaleId: '',
				priceLineVisible: false
			});

			candleSeriesRef.setData(
				candles.map((candle) => ({
					time: getChartTimeFromCandle(candle),
					open: heikinAshiView
						? (candle.indicators['ha_open'] ?? candle.open)
						: candle.open,
					high: heikinAshiView
						? (candle.indicators['ha_high'] ?? candle.high)
						: candle.high,
					low: heikinAshiView ? (candle.indicators['ha_low'] ?? candle.low) : candle.low,
					close: heikinAshiView
						? (candle.indicators['ha_close'] ?? candle.close)
						: candle.close
				}))
			);

			allSeriesObjects.push(candleSeriesRef);

			chartSeriesGroups.forEach((seriesGroup) => {
				const groupSeriesObjects = seriesGroup.series.reduce<TValidSeriesApi[]>(
					(acum, seriesItem) => {
						let series: TValidSeriesApi | null = null;

						if (seriesItem.seriesType === 'line') {
							const seriesOptions = seriesItem.seriesOptions as IChartSeriesTypeLine;

							series = chart.addLineSeries({
								color: seriesOptions.color ?? 'rgba(255,255,255,75)',
								lineStyle: getLineStyleForStringValue(
									seriesOptions?.lineStyle ?? 'solid'
								),
								lineWidth:
									(seriesOptions?.lineWidth as LineWidth) ?? (1 as LineWidth),
								lastValueVisible: false,
								crosshairMarkerVisible: false,
								priceLineVisible: false,
								priceScaleId: '',
								visible: seriesGroup.defaultVisible
							});
						} else if (seriesItem.seriesType === 'histogram') {
							const seriesOptions =
								seriesItem.seriesOptions as IChartSeriesTypeHistogram;

							series = chart.addHistogramSeries({
								color: seriesOptions.color ?? 'rgba(255,255,255,75)',
								priceFormat: {
									type: seriesOptions.priceFormatType
								},
								visible: seriesGroup.defaultVisible
							});
						}

						if (series) {
							series.setData(
								candles.map((candle) => ({
									time: getChartTimeFromCandle(candle),
									value: candle.indicators[seriesItem.indicatorKey] ?? 0
								}))
							);

							acum.push(series);
						}

						return acum;
					},
					[]
				);

				seriesObjectsByGroup.current[seriesGroup.groupLabel] = {
					visible: seriesGroup.defaultVisible,
					series: groupSeriesObjects
				};

				allSeriesObjects = [...allSeriesObjects, ...groupSeriesObjects];
			});

			return allSeriesObjects;
		},
		[candles, chartSeriesGroups]
	);

	const handleSeriesVisiblityToggle = (groupLabel: string) => {
		seriesObjectsByGroup.current[groupLabel]?.series.forEach((series) => {
			series.applyOptions({ visible: !series.options().visible });
		});
	};

	const tickerDisplayParts = [];

	if (tickerName) {
		tickerDisplayParts.push(tickerName);
	}

	if (tickerLabel) {
		tickerDisplayParts.push(tickerLabel);
	}

	return (
		<ChartBase chartOptions={chartOptions} onCreateChart={createChartHandler}>
			{tickerDisplayParts.length > 0 && (
				<ChartLegend label={tickerDisplayParts.join(' - ')}>
					{chartSeriesGroups.map((seriesGroup) => (
						<div key={seriesGroup.groupLabel}>
							<button
								onClick={() => handleSeriesVisiblityToggle(seriesGroup.groupLabel)}
							>
								{seriesGroup.groupLabel}
							</button>
						</div>
					))}
				</ChartLegend>
			)}
		</ChartBase>
	);
};

export default ChartCandles;
