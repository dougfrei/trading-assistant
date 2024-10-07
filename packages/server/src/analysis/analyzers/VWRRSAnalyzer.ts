import { Logger } from '@nestjs/common';
import { Candle } from 'src/entities/Candle.model';
import {
	ECandleAnalyzerAlertSentiment,
	ICandleAnalyzerAlertType,
	ICandleAnalyzerChartType,
	ICandleAnalyzerIndicatorType
} from 'src/interfaces/ICandleAnalyzer';
import { arrayFillToMinLength } from 'src/util/arrays';
import { isCandleIndicatorNumericValue } from 'src/util/candle';
import { twoDecimals } from 'src/util/math';
import { SMA } from 'technicalindicators';
import BaseAnalyzer from '../BaseAnalyzer';

interface IVWRRSAnalyzerParams {
	refCandles: Candle[];
	refLabel?: string;
	indicatorKey?: string;
	indicatorLabel?: string;
	rollingPeriod?: number;
	rollingPeriodVolShort?: number;
	rollingPeriodVolLong?: number;
	refTickerSymbol?: string;
}

export class VWRRSAnalyzer extends BaseAnalyzer {
	// reference: https://www.reddit.com/r/RealDayTrading/comments/rp5rmx/a_new_measure_of_relative_strength/

	private readonly logger = new Logger(VWRRSAnalyzer.name);

	static readonly ALERT_STRENGTH_NEW = 'vwrrs_strength_new';
	static readonly ALERT_STRENGTH_TRENDING = 'vwrrs_strength_trending';
	static readonly ALERT_WEAKNESS_NEW = 'vwrrs_weakness_new';
	static readonly ALERT_WEAKNESS_TRENDING = 'vwrrs_weakness_trending';

	protected rollingPeriod = 21;
	protected rollingPeriodVolShort = 21;
	protected rollingPeriodVolLong = 5;
	protected indicatorKey = 'vwrrs';
	protected indicatorLabel = 'Volume-weighted Real Relative Strength';
	protected refCandles: Candle[] = [];
	protected refLabel = 'market';

	public refTickerSymbol = '';

	constructor({
		rollingPeriod = 21,
		rollingPeriodVolShort = 21,
		rollingPeriodVolLong = 5,
		indicatorKey = 'vwrrs',
		indicatorLabel = 'Volume-weighted Real Relative Strength',
		refCandles = [],
		refLabel = 'market',
		refTickerSymbol = ''
	}: IVWRRSAnalyzerParams) {
		super();

		this.rollingPeriod = rollingPeriod;
		this.rollingPeriodVolShort = rollingPeriodVolShort;
		this.rollingPeriodVolLong = rollingPeriodVolLong;
		this.indicatorKey = indicatorKey;
		this.indicatorLabel = indicatorLabel;
		this.refCandles = refCandles;
		this.refLabel = refLabel;
		this.refTickerSymbol = refTickerSymbol;
	}

	getChartTypes(): ICandleAnalyzerChartType[] {
		return [
			{
				chartId: 'vwrrs',
				chartLabel: this.indicatorLabel,
				seriesItems: [
					{
						label: this.indicatorLabel,
						indicatorKey: this.indicatorKey,
						type: 'histogram',
						options: {
							color: '#fff'
						},
						priceLines: [
							{
								price: 0,
								color: 'rgba(255,255,255,50)'
							}
						]
					}
				]
			}
		];
	}

	getAlertTypes(): ICandleAnalyzerAlertType[] {
		return [
			{
				key: VWRRSAnalyzer.ALERT_STRENGTH_NEW,
				label: `New strength against ${this.refLabel}`,
				sentiment: ECandleAnalyzerAlertSentiment.NEUTRAL
			},
			{
				key: VWRRSAnalyzer.ALERT_STRENGTH_TRENDING,
				label: `Trending strength against ${this.refLabel}`,
				sentiment: ECandleAnalyzerAlertSentiment.NEUTRAL
			},
			{
				key: VWRRSAnalyzer.ALERT_WEAKNESS_NEW,
				label: `New weakness against ${this.refLabel}`,
				sentiment: ECandleAnalyzerAlertSentiment.NEUTRAL
			},
			{
				key: VWRRSAnalyzer.ALERT_WEAKNESS_TRENDING,
				label: `Trending weakness against ${this.refLabel}`,
				sentiment: ECandleAnalyzerAlertSentiment.NEUTRAL
			}
		];
	}

	getIndicatorTypes(): ICandleAnalyzerIndicatorType[] {
		return [
			{
				key: this.indicatorKey,
				label: this.indicatorLabel
				// render: {
				// 	renderAs: 'line',
				// 	color: '#fff'
				// }
			},
			{
				key: `${this.indicatorKey}_trend`,
				label: `${this.indicatorLabel} Trend`
			}
		];
	}

	getMinimumRequiredCandles() {
		return (
			Math.max(this.rollingPeriod, this.rollingPeriodVolLong, this.rollingPeriodVolShort) + 2
		);
	}

	setRefCandles(candles: Candle[]) {
		this.refCandles = candles;
	}

	calcVRRS(params: {
		curCandleSrc: Candle;
		curCandleRef: Candle;
		prevCandleSrc: Candle;
		prevCandleRef: Candle;
		volWeight: number;
	}): number | null {
		const prevCandleSrcSMA = params.prevCandleSrc.indicators.get('_vwrrs_close_sma');
		const prevCandleRefSMA = params.prevCandleRef.indicators.get('_vwrrs_close_sma');

		if (
			!isCandleIndicatorNumericValue(prevCandleSrcSMA) ||
			!isCandleIndicatorNumericValue(prevCandleRefSMA)
		) {
			return null;
		}

		const srcChange = params.curCandleSrc.close - prevCandleSrcSMA;
		const refChange = params.curCandleRef.close - prevCandleRefSMA;

		return twoDecimals(
			(srcChange / prevCandleSrcSMA - refChange / prevCandleRefSMA) * params.volWeight * 100
		);
	}

	calcTrendValue(curCandle: Candle, prevCandle: Candle) {
		const curValue = curCandle.indicators.get(this.indicatorKey);
		const prevValue = prevCandle.indicators.get(this.indicatorKey);

		if (!isCandleIndicatorNumericValue(curValue) || !isCandleIndicatorNumericValue(prevValue)) {
			return null;
		}

		let trend = 0;

		if (curValue > prevValue) {
			trend = 1;
		} else if (curValue < prevValue) {
			trend = -1;
		}

		return trend;
	}

	calcNotices(curCandle: Candle, prevCandle: Candle) {
		const curValue = curCandle.indicators.get(this.indicatorKey);
		const prevValue = prevCandle.indicators.get(this.indicatorKey);

		const alerts = new Set<string>();

		if (!isCandleIndicatorNumericValue(curValue) || !isCandleIndicatorNumericValue(prevValue)) {
			return alerts;
		}

		if (curValue > 0 && prevValue < 0) {
			alerts.add(VWRRSAnalyzer.ALERT_STRENGTH_NEW);
		}

		if (curValue > 0 && prevValue > 0 && curValue > prevValue) {
			alerts.add(VWRRSAnalyzer.ALERT_STRENGTH_TRENDING);
		}

		if (curValue < 0 && prevValue > 0) {
			alerts.add(VWRRSAnalyzer.ALERT_WEAKNESS_NEW);
		}

		if (curValue < 0 && prevValue < 0 && curValue < prevValue) {
			alerts.add(VWRRSAnalyzer.ALERT_WEAKNESS_TRENDING);
		}

		return alerts;
	}

	analyze(candles: Candle[]): Candle[] {
		// NOTE: rollingPeriodVolLong must be multiplied by a factor of 78
		// when working with period lengths of less than one day

		if (!candles.length || !this.refCandles.length) {
			return candles;
		}

		// const refSliceStart = this.refCandles.findIndex(
		// 	(refCandle) => refCandle.period.getTime() === candles[0].period.getTime()
		// );

		const refCandles = this.refCandles.slice(this.refCandles.length - candles.length);
		// const refCandles = this.refCandles.slice(refSliceStart);

		// this.logger.debug({
		// 	candleFirst: candles.at(0)?.period,
		// 	candleLast: candles.at(-1)?.period,
		// 	candleCount: candles.length,
		// 	refFirst: refCandles.at(0)?.period,
		// 	refLast: refCandles.at(-1)?.period,
		// 	refCount: refCandles.length,
		// 	refSliceStart: this.refCandles.length - candles.length,
		// 	refTotalCount: this.refCandles.length
		// });

		// const DEBUG_refCandlePeriods = refCandles.map((candle) => candle.period);
		// const DEBUG_candlePeriods = candles.map((candle) => candle.period);

		// this.logger.debug(DEBUG_candlePeriods);
		// this.logger.debug(DEBUG_refCandlePeriods);

		const isValid = candles.every((candle, index) => {
			const isMatch =
				candle.period.getTime() === refCandles[index]?.period.getTime() &&
				candle.periodType === refCandles[index]?.periodType;

			// if (!isMatch) {
			// 	this.logger.debug({
			// 		index,
			// 		candlePeriod: candle.period,
			// 		candlePeriodType: candle.periodType,
			// 		refCandlePeriod: refCandles[index].period,
			// 		refCandlePeriodType: refCandles[index].periodType
			// 	});
			// }

			return isMatch;
			// return (
			// 	candle.period.getTime() === refCandles[index]?.period.getTime() &&
			// 	candle.periodType === refCandles[index]?.periodType
			// );
		});

		if (!isValid) {
			throw new Error(
				`candles and refCandles period and/or period type mismatch [${candles.length} / ${refCandles.length}]`
			);
		}

		const srcValues = {
			closeSMA: arrayFillToMinLength(
				SMA.calculate({
					values: candles.map((candle) => candle.close),
					period: this.rollingPeriod
				}),
				candles.length
			),
			volShortSMA: arrayFillToMinLength(
				SMA.calculate({
					values: candles.map((candle) => candle.volume),
					period: this.rollingPeriodVolShort
				}),
				candles.length
			),
			volLongSMA: arrayFillToMinLength(
				SMA.calculate({
					values: candles.map((candle) => candle.volume),
					period: this.rollingPeriodVolLong
				}),
				candles.length
			)
		};

		const refValues = {
			closeSMA: arrayFillToMinLength(
				SMA.calculate({
					values: refCandles.map((candle) => candle.close),
					period: this.rollingPeriod
				}),
				refCandles.length
			),
			volShortSMA: arrayFillToMinLength(
				SMA.calculate({
					values: refCandles.map((candle) => candle.volume),
					period: this.rollingPeriodVolShort
				}),
				refCandles.length
			),
			volLongSMA: arrayFillToMinLength(
				SMA.calculate({
					values: refCandles.map((candle) => candle.volume),
					period: this.rollingPeriodVolLong
				}),
				refCandles.length
			)
		};

		// add indicator
		candles.forEach((curCandle, index, allCandles) => {
			let vwrrsValue: number | null = null;
			const prevCandle = allCandles[index - 1];

			const curRefCandle = refCandles[index];
			const prevRefCandle = refCandles[index - 1];

			// set values for source candles
			curCandle.indicators.set(
				'_vwrrs_close_sma',
				srcValues.closeSMA[index] !== null ? srcValues.closeSMA[index] : null
			);
			curCandle.indicators.set(
				'_vwrrs_vol_short_sma',
				srcValues.volShortSMA[index] !== null ? srcValues.volShortSMA[index] : null
			);
			curCandle.indicators.set(
				'_vwrrs_vol_long_sma',
				srcValues.volLongSMA[index] !== null ? srcValues.volLongSMA[index] : null
			);

			// set values for ref candles
			curRefCandle.indicators.set(
				'_vwrrs_close_sma',
				refValues.closeSMA[index] !== null ? refValues.closeSMA[index] : null
			);
			curRefCandle.indicators.set(
				'_vwrrs_vol_short_sma',
				refValues.volShortSMA[index] !== null ? refValues.volShortSMA[index] : null
			);
			curRefCandle.indicators.set(
				'_vwrrs_vol_long_sma',
				refValues.volLongSMA[index] !== null ? refValues.volLongSMA[index] : null
			);

			// calculate RS/RW values
			if (prevCandle && curRefCandle && prevRefCandle) {
				const prevVolShortSMA = prevCandle.indicators.get('_vwrrs_vol_short_sma');
				const prevVolLongSMA = prevCandle.indicators.get('_vwrrs_vol_long_sma');

				if (
					isCandleIndicatorNumericValue(prevVolShortSMA) &&
					isCandleIndicatorNumericValue(prevVolLongSMA)
				) {
					const volWeight = prevVolShortSMA / prevVolLongSMA;

					vwrrsValue = this.calcVRRS({
						curCandleSrc: curCandle,
						curCandleRef: curRefCandle,
						prevCandleSrc: prevCandle,
						prevCandleRef: prevRefCandle,
						volWeight
					});
				}
			}

			curCandle.indicators.set(this.indicatorKey, vwrrsValue);
			curCandle.indicators.set(
				`${this.indicatorKey}_trend`,
				prevCandle ? this.calcTrendValue(curCandle, prevCandle) : null
			);

			// add notices
			if (prevCandle) {
				curCandle.alerts = new Set([
					...curCandle.alerts,
					...this.calcNotices(curCandle, prevCandle)
				]);
			}

			// cleanup
			if (prevCandle) {
				prevCandle.indicators.delete('_vwrrs_close_sma');
				prevCandle.indicators.delete('_vwrrs_vol_short_sma');
				prevCandle.indicators.delete('_vwrrs_vol_long_sma');
			}

			if (index === allCandles.length - 1) {
				curCandle.indicators.delete('_vwrrs_close_sma');
				curCandle.indicators.delete('_vwrrs_vol_short_sma');
				curCandle.indicators.delete('_vwrrs_vol_long_sma');
			}
		});

		// add notices
		// candles.forEach((curCandle, index, allCandles) => {
		// 	const prevCandle = allCandles[index - 1];

		// 	if (!prevCandle) {
		// 		return;
		// 	}

		// 	const curValue = curCandle.indicators.get(this.indicatorKey);
		// 	const prevValue = prevCandle.indicators.get(this.indicatorKey);

		// 	// let trend = null;

		// 	// if (isCandleIndicatorNumericValue(curValue) && isCandleIndicatorNumericValue(prevValue)) {
		// 	// 	if (curValue > prevValue) {
		// 	// 		trend = 1;
		// 	// 	} else if (curValue < prevValue) {
		// 	// 		trend = -1;
		// 	// 	} else {
		// 	// 		trend = 0;
		// 	// 	}
		// 	// }

		// 	// curCandle.indicators.set(`${this.indicatorKey}_trend`, trend);

		// 	/* if (!isCandleIndicatorNumericValue(curValue) || !isCandleIndicatorNumericValue(prevValue)) {
		// 		return;
		// 	}

		// 	if (curValue > 0 && prevValue < 0) {
		// 		curCandle.alerts.add(VWRRSAnalyzer.ALERT_STRENGTH_NEW);
		// 	}

		// 	if (curValue > 0 && prevValue > 0 && curValue > prevValue) {
		// 		curCandle.alerts.add(VWRRSAnalyzer.ALERT_STRENGTH_TRENDING);
		// 	}

		// 	if (curValue < 0 && prevValue > 0) {
		// 		curCandle.alerts.add(VWRRSAnalyzer.ALERT_WEAKNESS_NEW);
		// 	}

		// 	if (curValue < 0 && prevValue < 0 && curValue < prevValue) {
		// 		curCandle.alerts.add(VWRRSAnalyzer.ALERT_WEAKNESS_TRENDING);
		// 	} */
		// });

		// cleanup indicators used for processing
		// candles.forEach((candle) => {
		// 	candle.indicators.delete('_vwrrs_close_sma');
		// 	candle.indicators.delete('_vwrrs_vol_short_sma');
		// 	candle.indicators.delete('_vwrrs_vol_long_sma');
		// });

		return candles;
	}
}
