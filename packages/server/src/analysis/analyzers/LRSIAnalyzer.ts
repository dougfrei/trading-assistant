import LRSI from 'src/analysis/indicators/LRSI';
import { Candle } from 'src/entities/Candle.model';
import {
	ECandleAnalyzerAlertSentiment,
	ICandleAnalyzerAlertType,
	ICandleAnalyzerChartType,
	ICandleAnalyzerIndicatorType
} from 'src/interfaces/ICandleAnalyzer';
import { isCandleIndicatorNumericValue } from 'src/util/candle';
import { twoDecimals } from 'src/util/math';
import BaseAnalyzer from '../BaseAnalyzer';

interface ILRSIAnalyzerParams {
	fastPeriodGamma?: number;
	slowPeriodGamma?: number;
	overbought?: number;
	oversold?: number;
}

export class LRSIAnalyzer extends BaseAnalyzer {
	static readonly INDICATOR_KEY_FAST = 'lrsi_fast';
	static readonly INDICATOR_KEY_SLOW = 'lrsi_slow';
	static readonly INDICATOR_KEY_FAST_TREND = 'lrsi_fast_trend';
	static readonly INDICATOR_KEY_SLOW_TREND = 'lrsi_slow_trend';
	static readonly ALERT_FAST_UPTREND_START = 'lrsi_fast_uptrend_start';
	static readonly ALERT_FAST_DOWNTREND_START = 'lrsi_fast_downtrend_start';
	static readonly ALERT_SLOW_UPTREND_START = 'lrsi_slow_uptrend_start';
	static readonly ALERT_SLOW_DOWNTREND_START = 'lrsi_slow_downtrend_start';
	static readonly ALERT_FAST_BREAK_OS_UP = 'lrsi_fast_break_os_up';
	static readonly ALERT_SLOW_BREAK_OS_UP = 'lrsi_slow_break_os_up';
	static readonly ALERT_FAST_BREAK_OB_DOWN = 'lrsi_fast_break_ob_down';
	static readonly ALERT_SLOW_BREAK_OB_DOWN = 'lrsi_slow_break_ob_down';

	protected fastPeriodGamma = 0.4;
	protected slowPeriodGamma = 0.7;
	protected overbought = 0.8;
	protected oversold = 0.2;

	public readonly minimumRequiredCandles = 2;

	constructor({
		fastPeriodGamma = 0.4,
		slowPeriodGamma = 0.7,
		overbought = 0.8,
		oversold = 0.2
	}: ILRSIAnalyzerParams = {}) {
		super();

		this.fastPeriodGamma = fastPeriodGamma;
		this.slowPeriodGamma = slowPeriodGamma;
		this.overbought = overbought;
		this.oversold = oversold;
	}

	getChartTypes(): ICandleAnalyzerChartType[] {
		return [
			{
				chartId: 'lrsi',
				chartLabel: 'LRSI',
				seriesItems: [
					{
						label: 'Fast Period',
						indicatorKey: LRSIAnalyzer.INDICATOR_KEY_FAST,
						type: 'line',
						options: {
							color: '#fff'
						},
						priceLines: [
							{
								price: this.overbought,
								color: 'rgba(255,255,255,50)'
							},
							{
								price: this.oversold,
								color: 'rgba(255,255,255,50)'
							}
						]
					},
					{
						label: 'Slow Period',
						indicatorKey: LRSIAnalyzer.INDICATOR_KEY_SLOW,
						type: 'line',
						options: {
							color: '#0f0'
						}
					}
				]
			}
		];
	}

	getIndicatorTypes(): ICandleAnalyzerIndicatorType[] {
		return [
			{
				key: LRSIAnalyzer.INDICATOR_KEY_FAST,
				label: `Laguerre RSI fast period (${this.fastPeriodGamma} gamma)`
			},
			{
				key: LRSIAnalyzer.INDICATOR_KEY_SLOW,
				label: `Laguerre RSI slow period (${this.slowPeriodGamma} gamma)`
			}
		];
	}

	getAlertTypes(): ICandleAnalyzerAlertType[] {
		return [
			{
				key: LRSIAnalyzer.ALERT_FAST_DOWNTREND_START,
				label: 'LRSI Downtrend Start (fast)',
				sentiment: ECandleAnalyzerAlertSentiment.BEARISH
			},
			{
				key: LRSIAnalyzer.ALERT_SLOW_DOWNTREND_START,
				label: 'LRSI Downtrend Start (slow)',
				sentiment: ECandleAnalyzerAlertSentiment.BEARISH
			},
			{
				key: LRSIAnalyzer.ALERT_FAST_UPTREND_START,
				label: 'LRSI Uptrend Start (fast)',
				sentiment: ECandleAnalyzerAlertSentiment.BULLISH
			},
			{
				key: LRSIAnalyzer.ALERT_SLOW_UPTREND_START,
				label: 'LRSI Uptrend Start (slow)',
				sentiment: ECandleAnalyzerAlertSentiment.BULLISH
			},
			{
				key: LRSIAnalyzer.ALERT_FAST_BREAK_OS_UP,
				label: 'LRSI break oversold upwards (fast)',
				sentiment: ECandleAnalyzerAlertSentiment.BULLISH
			},
			{
				key: LRSIAnalyzer.ALERT_SLOW_BREAK_OS_UP,
				label: 'LRSI break oversold upwards (slow)',
				sentiment: ECandleAnalyzerAlertSentiment.BULLISH
			},
			{
				key: LRSIAnalyzer.ALERT_FAST_BREAK_OB_DOWN,
				label: 'LRSI break overbought downwards (fast)',
				sentiment: ECandleAnalyzerAlertSentiment.BEARISH
			},
			{
				key: LRSIAnalyzer.ALERT_SLOW_BREAK_OB_DOWN,
				label: 'LRSI break overbought downwards (slow)',
				sentiment: ECandleAnalyzerAlertSentiment.BEARISH
			}
		];
	}

	analyze(candles: Candle[]): Candle[] {
		const lrsiFast = new LRSI(this.fastPeriodGamma);
		lrsiFast.applyFormatter((value) =>
			isCandleIndicatorNumericValue(value) ? twoDecimals(value) : value
		);

		const lrsiSlow = new LRSI(this.slowPeriodGamma);
		lrsiSlow.applyFormatter((value) =>
			isCandleIndicatorNumericValue(value) ? twoDecimals(value) : value
		);

		return candles.map((candle, index) => {
			const curFast = lrsiFast.push(candle.close);
			const curSlow = lrsiSlow.push(candle.close);

			candle.indicators.set(LRSIAnalyzer.INDICATOR_KEY_FAST, curFast);
			candle.indicators.set(LRSIAnalyzer.INDICATOR_KEY_SLOW, curSlow);

			if (index < 1) {
				return candle;
			}

			const prevFast = candles[index - 1].indicators.get(LRSIAnalyzer.INDICATOR_KEY_FAST);
			const prevSlow = candles[index - 1].indicators.get(LRSIAnalyzer.INDICATOR_KEY_SLOW);

			if (
				!isCandleIndicatorNumericValue(curFast) ||
				!isCandleIndicatorNumericValue(curSlow) ||
				!isCandleIndicatorNumericValue(prevFast) ||
				!isCandleIndicatorNumericValue(prevSlow)
			) {
				return candle;
			}

			let fastTrend = 0;
			let slowTrend = 0;

			if (curFast > prevFast) {
				fastTrend = 1;
			} else if (curFast < prevFast) {
				fastTrend = -1;
			}

			if (curSlow > prevSlow) {
				slowTrend = 1;
			} else if (curSlow < prevSlow) {
				slowTrend = -1;
			}

			candle.indicators.set(LRSIAnalyzer.INDICATOR_KEY_FAST_TREND, fastTrend);
			candle.indicators.set(LRSIAnalyzer.INDICATOR_KEY_SLOW_TREND, slowTrend);

			if (prevFast === 0 && curFast > 0) {
				// possible start of move upwards
				candle.alerts.add(LRSIAnalyzer.ALERT_FAST_UPTREND_START);
			} else if (prevFast === 1 && curFast < 1) {
				// possible start of move downwards
				candle.alerts.add(LRSIAnalyzer.ALERT_FAST_DOWNTREND_START);
			}

			if (prevSlow === 0 && curSlow > 0) {
				// likely start of move upwards
				candle.alerts.add(LRSIAnalyzer.ALERT_SLOW_UPTREND_START);
			} else if (prevSlow === 1 && curSlow < 1) {
				// likely start of move downwards
				candle.alerts.add(LRSIAnalyzer.ALERT_SLOW_DOWNTREND_START);
			}

			if (prevFast < this.oversold && curFast >= this.oversold) {
				candle.alerts.add(LRSIAnalyzer.ALERT_FAST_BREAK_OS_UP);
			} else if (prevFast > this.overbought && curFast <= this.overbought) {
				candle.alerts.add(LRSIAnalyzer.ALERT_FAST_BREAK_OB_DOWN);
			}

			if (prevSlow < this.oversold && curSlow >= this.oversold) {
				candle.alerts.add(LRSIAnalyzer.ALERT_SLOW_BREAK_OS_UP);
			} else if (prevSlow > this.overbought && curSlow <= this.overbought) {
				candle.alerts.add(LRSIAnalyzer.ALERT_SLOW_BREAK_OB_DOWN);
			}

			return candle;
		});
	}
}
