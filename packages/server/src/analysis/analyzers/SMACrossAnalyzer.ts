import { Candle } from 'src/entities/Candle.model';
import {
	ECandleAnalyzerAlertSentiment,
	ICandleAnalyzerAlertType,
	ICandleAnalyzerChartSeriesGroup,
	ICandleAnalyzerIndicatorType
} from 'src/interfaces/ICandleAnalyzer';
import { isCandleIndicatorNumericValue } from 'src/util/candle';
import { twoDecimals } from 'src/util/math';
import BaseAnalyzer from '../BaseAnalyzer';
import SMA from '../indicators/SMA';

interface ISMACrossAnalyzerParams {
	colorMap?: Record<number, string>;
}

export class SMACrossAnalyzer extends BaseAnalyzer {
	protected colorMap: Record<number, string> = {};

	constructor(
		public readonly periods: number[] = [20, 50, 100, 200],
		public readonly params: ISMACrossAnalyzerParams = {}
	) {
		super();

		this.colorMap = params.colorMap ?? {};
	}

	private getCrossUpKey(period: number): string {
		return `sma_${period}_cross_up`;
	}

	private getCrossDownKey(period: number): string {
		return `sma_${period}_cross_down`;
	}

	private getPeriodIndicatorKey(period: number): string {
		return `sma_${period}`;
	}

	getMainChartSeriesGroups(): ICandleAnalyzerChartSeriesGroup[] {
		return [
			{
				groupLabel: `SMA ${this.periods.join('/')}`,
				defaultVisible: true,
				series: this.periods.map((period) => ({
					valueTypeId: `sma_${period}`,
					seriesLabel: `SMA ${period}`,
					indicatorKey: `sma_${period}`,
					seriesType: 'line',
					seriesOptions: {
						lineStyle: 'solid',
						lineWidth: 1,
						color: this.colorMap[period] ?? 'rgba(255,255,255,40)'
					}
				}))
			}
		];
	}

	getAlertTypes(): ICandleAnalyzerAlertType[] {
		return this.periods.reduce<ICandleAnalyzerAlertType[]>((acum, period) => {
			const signalKeyCrossUp = this.getCrossUpKey(period);
			const signalKeyCrossDown = this.getCrossDownKey(period);

			acum.push({
				key: signalKeyCrossUp,
				label: `SMA ${period} cross up`,
				sentiment: ECandleAnalyzerAlertSentiment.BULLISH
			});

			acum.push({
				key: signalKeyCrossDown,
				label: `SMA ${period} cross down`,
				sentiment: ECandleAnalyzerAlertSentiment.BEARISH
			});

			return acum;
		}, []);
	}

	getIndicatorTypes(): ICandleAnalyzerIndicatorType[] {
		return this.periods.map((period) => ({
			key: this.getPeriodIndicatorKey(period),
			label: `SMA ${period}`
		}));
	}

	getMinimumRequiredCandles() {
		return Math.max(...this.periods) + 1;
	}

	analyze(candles: Candle[]): Candle[] {
		this.periods.forEach((period) => {
			const sma = new SMA(period);
			sma.applyFormatter((value) =>
				isCandleIndicatorNumericValue(value) ? twoDecimals(value) : value
			);

			const indicatorKey = this.getPeriodIndicatorKey(period);
			const signalKeyCrossUp = this.getCrossUpKey(period);
			const signalKeyCrossDown = this.getCrossDownKey(period);

			candles.forEach((candle, index, candles) => {
				const curSMA = sma.push(candle.close);

				candle.indicators.set(indicatorKey, curSMA);

				if (index < 1) {
					return;
				}

				const prevCandle = candles[index - 1];
				const prevSMA = prevCandle.indicators.get(indicatorKey);

				if (
					!isCandleIndicatorNumericValue(curSMA) ||
					!isCandleIndicatorNumericValue(prevSMA) ||
					!prevCandle
				) {
					return candle;
				}

				if (
					(candle.open < curSMA && candle.close > curSMA) ||
					(prevCandle.close < prevSMA && candle.close > curSMA)
				) {
					// breaking above SMA
					candle.alerts.add(signalKeyCrossUp);
				} else if (
					(candle.open > curSMA && candle.close < curSMA) ||
					(prevCandle.close > prevSMA && candle.close < curSMA)
				) {
					// breaking below SMA
					candle.alerts.add(signalKeyCrossDown);
				}
			});
		});

		return candles;
	}
}
