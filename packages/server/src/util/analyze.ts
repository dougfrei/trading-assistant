import BaseAnalyzer from 'src/analysis/BaseAnalyzer';
import { Candle } from 'src/entities/Candle.model';
import {
	ICandleAnalyzerAlertType,
	ICandleAnalyzerChartSeriesGroup,
	ICandleAnalyzerChartType,
	ICandleAnalyzerIndicatorType
} from 'src/interfaces/ICandleAnalyzer';
import { getErrorObject } from './errors';

/**
 * Return an array of ICandleAnalyzerChartSeriesGroup objects from the provided
 * candle analyzers that represent data to be shown on the main candlestick chart
 *
 * @param analyzerSet An array of candle analyzers
 * @returns An array of ICandleAnalyzerChartSeriesGroup objects
 */
export function getAnalyzerMainChartSeriesGroups(analyzerSet: BaseAnalyzer[]) {
	return analyzerSet.reduce<ICandleAnalyzerChartSeriesGroup[]>(
		(acum, analyzer) => [...acum, ...analyzer.getMainChartSeriesGroups()],
		[]
	);
}

/**
 * Return an array of ICandleAnalyzerChartSeriesGroup objects from the provided
 * candle analyzers that represent data to be shown on the volume chart
 *
 * @param analyzerSet An array of candle analyzers
 * @returns An array of ICandleAnalyzerChartSeriesGroup objects
 */
export function getAnalyzerVolumeChartSeriesGroups(analyzerSet: BaseAnalyzer[]) {
	return analyzerSet.reduce<ICandleAnalyzerChartSeriesGroup[]>(
		(acum, analyzer) => [...acum, ...analyzer.getVolumeChartSeriesGroups()],
		[]
	);
}

/**
 * Return an array of ICandleAnalyzerChartType objects from the provided candle
 * analyzers that represent additional charts to show below the main candlestick
 * chart
 *
 * @param analyzerSet An array of candle analyzers
 * @returns An array of ICandleAnalyzerChartType objects
 */
export function getAnalyzerChartTypes(analyzerSet: BaseAnalyzer[]) {
	return analyzerSet.reduce<ICandleAnalyzerChartType[]>(
		(acum, analyzer) => [...acum, ...analyzer.getChartTypes()],
		[]
	);
}

/**
 * Return an array of objects represetning the indicator fields that would be added
 * to candles during processing with the specified analyzers
 *
 * @param analyzerSet An array of candle analyzers
 * @returns An array of ICandleAnalyzerIndicatorType objects describing the indicator values that would be added to candles during processing
 */
export function getAnalyzerSetIndicatorTypes(analyzerSet: BaseAnalyzer[]) {
	return analyzerSet.reduce<ICandleAnalyzerIndicatorType[]>(
		(acum, analyzer) => [...acum, ...analyzer.getIndicatorTypes()],
		[]
	);
}

/**
 * Return an array of objects represetning the alert types that could be added to
 * candles during processing with the specified analyzers
 *
 * @param analyzerSet An array of candle analyzers
 * @returns An array of ICandleAnalyzerAlertType objects describing the alert types that could be added to candles during processing
 */
export function getAnalyzerSetAlertTypes(analyzerSet: BaseAnalyzer[]) {
	return analyzerSet.reduce<ICandleAnalyzerAlertType[]>(
		(acum, analyzer) => [...acum, ...analyzer.getAlertTypes()],
		[]
	);
}

/**
 * Process the provided candles through the specified analyzers
 *
 * @param candles An array of Candle objects to analyze
 * @param analyzerSet An array of analyzers to use
 * @returns A tuple with the first element being an errors string array and the second being the input array of candle objects with the 'indicators' and 'alerts' properties populated
 */
export function analyzeCandles(
	candles: Candle[],
	analyzerSet: BaseAnalyzer[]
): [string[], Candle[]] {
	const errors: string[] = [];
	const result = analyzerSet.reduce((acum, analyzer) => {
		try {
			const analyzedCandles = analyzer.analyze(acum);

			if (!Array.isArray(analyzedCandles)) {
				errors.push(`${analyzer.constructor.name}: failed to return a Candle array`);

				return acum;
			}

			return analyzedCandles;
		} catch (err: unknown) {
			errors.push(
				`${analyzer.constructor.name}: ${
					getErrorObject(err, 'An error occurred while running the analyzer').message
				}`
			);
		}

		return acum;
	}, candles);

	return [errors, result];
}
