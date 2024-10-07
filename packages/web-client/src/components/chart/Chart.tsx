import ICandle from '@src/interfaces/ICandle';
import {
	IGqlCandleAnalyzerChartSeriesGroup,
	IGqlCandleAnalyzerChartType
} from '@src/interfaces/IGqlResponses';
import Emitter from '@src/util/emitter';
import { useEffect, useMemo, useRef } from 'react';
import { IChartColors } from './Chart.interfaces';
import styles from './Chart.module.css';
import { getDefaultChartColors } from './Chart.util';
import { IRequestAdditionalDataParams } from './ChartBase';
import ChartCandleAnalyzer from './ChartCandleAnalyzer';
import ChartCandles from './ChartCandles';
import ChartContext from './ChartContext';
import ChartVolume from './ChartVolume';

const Chart: React.FC<{
	candles: ICandle[];
	tickerName?: string;
	tickerLabel?: string;
	chartColors?: IChartColors;
	showVolume?: boolean;
	mainChartSeriesGroups?: IGqlCandleAnalyzerChartSeriesGroup[];
	additionalChartTypes?: IGqlCandleAnalyzerChartType[];
	onRequestAdditionalData?: (currentFirstPeriod: Date) => void;
}> = ({
	candles,
	tickerName = '',
	tickerLabel = '',
	chartColors = getDefaultChartColors(),
	showVolume = true,
	mainChartSeriesGroups = [],
	additionalChartTypes = [],
	onRequestAdditionalData
}) => {
	const contextEmitter = useRef(new Emitter());
	const isRequestingData = useRef(false);
	const orderedCandles = useMemo(
		() => [...candles].sort((a, b) => a.period - b.period),
		[candles]
	);

	useEffect(() => {
		const handleRequestAdditionalData = ({
			currentFirstPeriod
		}: IRequestAdditionalDataParams) => {
			if (
				!currentFirstPeriod ||
				isRequestingData.current ||
				typeof onRequestAdditionalData === 'undefined'
			) {
				return;
			}

			onRequestAdditionalData(currentFirstPeriod);

			isRequestingData.current = true;
		};

		if (contextEmitter.current) {
			contextEmitter.current.on('requestAdditionalData', handleRequestAdditionalData);
		}

		return () => {
			if (contextEmitter.current) {
				contextEmitter.current.off('requestAdditionalData', handleRequestAdditionalData);
			}
		};
	}, [contextEmitter.current, onRequestAdditionalData]);

	useEffect(() => {
		isRequestingData.current = false;
	}, [candles]);

	return (
		<ChartContext.Provider value={contextEmitter.current}>
			<div className={styles.chartsContainer}>
				<ChartCandles
					candles={orderedCandles}
					chartColors={chartColors}
					chartSeriesGroups={mainChartSeriesGroups}
					tickerName={tickerName}
					tickerLabel={tickerLabel}
				/>
				{showVolume && (
					<ChartVolume
						candles={orderedCandles}
						chartColors={chartColors}
						timeScaleVisible={false}
					/>
				)}
				{additionalChartTypes.map((chartType) => (
					<ChartCandleAnalyzer
						key={chartType.chartId}
						candles={orderedCandles}
						chartColors={chartColors}
						chartType={chartType}
					/>
				))}
			</div>
		</ChartContext.Provider>
	);
};

export default Chart;
