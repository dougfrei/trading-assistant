import {
	BarData,
	CustomData,
	DeepPartial,
	HistogramData,
	IChartApi,
	LineData,
	Logical,
	LogicalRangeChangeEventHandler,
	MouseEventHandler,
	Time,
	TimeChartOptions,
	TimeRangeChangeEventHandler,
	createChart
} from 'lightweight-charts';
import { useContext, useEffect, useRef } from 'react';
import { TISeriesApiAny } from './Chart.interfaces';
import ChartContext from './ChartContext';

// reference:
// https://tradingview.github.io/lightweight-charts/tutorials/how_to/set-crosshair-position

interface ITimeChangeParams {
	chart: IChartApi;
	scrollPos: number;
}

interface IRangeChangeParams {
	chart: IChartApi;
	rangeFrom: Logical | undefined;
	rangeTo: Logical | undefined;
}

interface ICrosshairMoveParams {
	chart: IChartApi;
	dataPoint: BarData<Time> | CustomData<Time> | HistogramData<Time> | LineData<Time> | undefined;
}

export interface IRequestAdditionalDataParams {
	currentFirstPeriod: Date | null;
}

const ChartBase: React.FC<{
	chartOptions: DeepPartial<TimeChartOptions>;
	onCreateChart?: (chart: IChartApi) => TISeriesApiAny[];
	children?: React.ReactNode;
}> = ({ chartOptions, onCreateChart, children = null }) => {
	const chartRef = useRef<IChartApi | null>(null);
	const currentSeriesObjectsRef = useRef<TISeriesApiAny[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const chartEmitter = useContext(ChartContext);

	/**
	 * Primary effect that runs on mount/unmount. It will add a listener for window
	 * resize events and remove the current chart instance (if it exists) during
	 * unmount.
	 */
	useEffect(() => {
		const handleWindowResize = () => {
			if (!containerRef.current || !chartRef.current) {
				return;
			}

			chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
		};

		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);

			if (chartRef.current) {
				chartRef.current.remove();
			}
		};
	}, []);

	/**
	 * This effect applies new options to the chart instance when "chartOptions"
	 * changes
	 */
	useEffect(() => {
		if (chartRef.current) {
			chartRef.current.applyOptions(chartOptions);
		}
	}, [chartOptions]);

	/**
	 * This effect handles the creation of the chart instance, if necessary, and
	 * runs the "onCreateChart" callback function when it changes
	 */
	useEffect(() => {
		if (onCreateChart && containerRef.current) {
			if (chartRef.current) {
				// The chart instance has been created, so we'll remove the current
				// series elements before the 'onCreateChart' handler is run again
				currentSeriesObjectsRef.current.forEach((series) => {
					chartRef.current?.removeSeries(series);
				});
			} else {
				// The chart instance has not been created yet, so we'll create it now
				chartRef.current = createChart(containerRef.current, chartOptions);
			}

			currentSeriesObjectsRef.current = onCreateChart(chartRef.current);
		}
	}, [onCreateChart]);

	/**
	 * This effect adds handlers for time range, logical range, and crosshair events
	 * on the current chart instance. It also add listeners to the chartEmitter
	 * object so that this chart can respond to those same changes when they occur
	 * in the linked charts.
	 */
	useEffect(() => {
		const internalTimeRangeChangeHandler: TimeRangeChangeEventHandler<Time> = () => {
			const scrollPos = chartRef.current?.timeScale().scrollPosition();

			if (!chartRef.current || typeof scrollPos === 'undefined') {
				return;
			}

			// Emit the 'visibleTimeRangeChange' event so that other charts are aware of the change
			chartEmitter.emit<ITimeChangeParams>('visibleTimeRangeChange', {
				chart: chartRef.current,
				scrollPos
			});
		};

		const internalLogicalRangeChangeHandler: LogicalRangeChangeEventHandler = (range) => {
			if (!chartRef.current) {
				return;
			}

			const rangeFrom = range?.from;
			const rangeTo = range?.to;

			if (typeof rangeFrom === 'number' && rangeFrom < 10) {
				const firstDataTime =
					currentSeriesObjectsRef.current[0]?.dataByIndex(0)?.time ?? null;
				const currentFirstPeriod =
					typeof firstDataTime === 'number' ? new Date(firstDataTime * 1000) : null;

				chartEmitter.emit<IRequestAdditionalDataParams>('requestAdditionalData', {
					currentFirstPeriod
				});
			}

			// Emit the 'visibileLogicalRangeChange' event so that other charts are aware of the change
			chartEmitter.emit<IRangeChangeParams>('visibileLogicalRangeChange', {
				chart: chartRef.current,
				rangeFrom,
				rangeTo
			});
		};

		const internalCrosshairMoveHandler: MouseEventHandler<Time> = (param) => {
			if (!chartRef.current || !param.time || !currentSeriesObjectsRef.current.length) {
				return;
			}

			const dataPoint = param.seriesData.get(currentSeriesObjectsRef.current[0]);

			// Emit the 'crosshairMove' event so that other charts are aware of the change
			chartEmitter.emit<ICrosshairMoveParams>('crosshairMove', {
				chart: chartRef.current,
				dataPoint
			});
		};

		const externalTimeRangeChangeHandler = ({ chart, scrollPos }: ITimeChangeParams) => {
			if (!chartRef.current || chart === chartRef.current) {
				return;
			}

			chartRef.current.timeScale().applyOptions({
				rightOffset: scrollPos
			});
		};

		const externalLogicalRangeChangeHandler = ({
			chart,
			rangeFrom,
			rangeTo
		}: IRangeChangeParams) => {
			if (
				!chartRef.current ||
				typeof rangeFrom === 'undefined' ||
				typeof rangeTo === 'undefined' ||
				chart === chartRef.current
			) {
				return;
			}

			chartRef.current.timeScale().setVisibleLogicalRange({
				from: rangeFrom,
				to: rangeTo
			});
		};

		const externalCrosshairMoveHandler = ({ chart, dataPoint }: ICrosshairMoveParams) => {
			if (!chartRef.current || chart === chartRef.current) {
				return;
			}

			if (!dataPoint || !currentSeriesObjectsRef.current.length) {
				chartRef.current.clearCrosshairPosition();
				return;
			}

			chartRef.current.setCrosshairPosition(
				// @ts-expect-error This is fine since we only want a vertical crosshair sync
				undefined,
				dataPoint.time,
				currentSeriesObjectsRef.current[0]
			);
		};

		if (containerRef.current && chartRef.current) {
			chartRef.current
				.timeScale()
				.subscribeVisibleTimeRangeChange(internalTimeRangeChangeHandler);

			chartRef.current
				.timeScale()
				.subscribeVisibleLogicalRangeChange(internalLogicalRangeChangeHandler);

			chartRef.current.subscribeCrosshairMove(internalCrosshairMoveHandler);

			// Listen to 'visibleTimeRangeChange' events from other charts
			chartEmitter.on<ITimeChangeParams>(
				'visibleTimeRangeChange',
				externalTimeRangeChangeHandler
			);

			// Listen to 'visibileLogicalRangeChange' events from other charts
			chartEmitter.on<IRangeChangeParams>(
				'visibileLogicalRangeChange',
				externalLogicalRangeChangeHandler
			);

			// Listen to 'crosshairMove' events from other charts to sync the crosshair with this chart
			chartEmitter.on<ICrosshairMoveParams>('crosshairMove', externalCrosshairMoveHandler);
		}

		return () => {
			if (chartRef.current) {
				chartRef.current
					.timeScale()
					.unsubscribeVisibleTimeRangeChange(internalTimeRangeChangeHandler);
				chartRef.current
					.timeScale()
					.unsubscribeVisibleLogicalRangeChange(internalLogicalRangeChangeHandler);
				chartRef.current.unsubscribeCrosshairMove(internalCrosshairMoveHandler);

				chartEmitter.off('visibleTimeRangeChange', externalTimeRangeChangeHandler);
				chartEmitter.off('visibileLogicalRangeChange', externalLogicalRangeChangeHandler);
				chartEmitter.off('crosshairMove', externalCrosshairMoveHandler);
			}
		};
	}, [chartEmitter, chartRef.current]);

	return (
		<div ref={containerRef} style={{ position: 'relative' }}>
			{children}
		</div>
	);
};

export default ChartBase;
