import { Candle } from 'src/entities/Candle.model';
import {
	ECandleAnalyzerAlertSentiment,
	ICandleAnalyzerAlertType,
	ICandleAnalyzerIndicatorType
} from 'src/interfaces/ICandleAnalyzer';
import { arrayFillToMinLength } from 'src/util/arrays';
import { isCandleIndicatorNumericValue } from 'src/util/candle';
import { twoDecimals } from 'src/util/math';
import { EMA } from 'technicalindicators';
import BaseAnalyzer from '../BaseAnalyzer';

export class EMACrossAnalyzer extends BaseAnalyzer {
	static readonly ALERT_VALUE_ZONE = 'ema_value_zone';

	constructor(
		public readonly shortPeriod = 3,
		public readonly longPeriod = 8
	) {
		super();
	}

	private getCrossUpKey(): string {
		return `ema_${this.shortPeriod}_${this.longPeriod}_cross_up`;
	}

	private getCrossDownKey(): string {
		return `ema_${this.shortPeriod}_${this.longPeriod}_cross_down`;
	}

	private getIndicatorKey(period: number): string {
		return `ema_${period}`;
	}

	getAlertTypes(): ICandleAnalyzerAlertType[] {
		return [
			{
				key: this.getCrossUpKey(),
				label: `EMA ${this.shortPeriod}/${this.longPeriod} cross up`,
				sentiment: ECandleAnalyzerAlertSentiment.BULLISH
			},
			{
				key: this.getCrossDownKey(),
				label: `EMA ${this.shortPeriod}/${this.longPeriod} cross down`,
				sentiment: ECandleAnalyzerAlertSentiment.BEARISH
			},
			{
				key: EMACrossAnalyzer.ALERT_VALUE_ZONE,
				label: `Closing price within EMA ${this.shortPeriod}/${this.longPeriod} value zone`,
				sentiment: ECandleAnalyzerAlertSentiment.NEUTRAL
			}
		];
	}

	getIndicatorTypes(): ICandleAnalyzerIndicatorType[] {
		return [
			{
				key: this.getIndicatorKey(this.shortPeriod),
				label: `EMA ${this.shortPeriod}`
			},
			{
				key: this.getIndicatorKey(this.longPeriod),
				label: `EMA ${this.longPeriod}`
			}
		];
	}

	getMinimumRequiredCandles() {
		return Math.max(this.shortPeriod, this.longPeriod) + 1;
	}

	analyze(candles: Candle[]): Candle[] {
		const shortIndicatorKey = this.getIndicatorKey(this.shortPeriod);
		const longIndicatorKey = this.getIndicatorKey(this.longPeriod);
		const signalIndicatorNameCrossUp = this.getCrossUpKey();
		const signalIndicatorNameCrossDown = this.getCrossDownKey();

		const shortValues = arrayFillToMinLength(
			EMA.calculate({
				values: candles.map((candle) => candle.close),
				period: this.shortPeriod
			}),
			candles.length
		);

		const longValues = arrayFillToMinLength(
			EMA.calculate({
				values: candles.map((candle) => candle.close),
				period: this.longPeriod
			}),
			candles.length
		);

		candles.forEach((candle, index, candles) => {
			candle.indicators.set(
				shortIndicatorKey,
				typeof shortValues[index] !== 'undefined' && shortValues[index] !== null
					? twoDecimals(shortValues[index])
					: null
			);

			candle.indicators.set(
				longIndicatorKey,
				typeof longValues[index] !== 'undefined' && longValues[index] !== null
					? twoDecimals(longValues[index])
					: null
			);

			if (index < 1) {
				return;
			}

			const curShort = candle.indicators.get(shortIndicatorKey);
			const curLong = candle.indicators.get(longIndicatorKey);
			const prevShort = candles[index - 1].indicators.get(shortIndicatorKey);
			const prevLong = candles[index - 1].indicators.get(longIndicatorKey);

			if (
				!isCandleIndicatorNumericValue(curShort) ||
				!isCandleIndicatorNumericValue(curLong) ||
				!isCandleIndicatorNumericValue(prevShort) ||
				!isCandleIndicatorNumericValue(prevLong)
			) {
				return;
			}

			if (curShort > curLong && prevShort < prevLong) {
				// new cross up
				candle.alerts.add(signalIndicatorNameCrossUp);
			} else if (curShort < curLong && prevShort > prevLong) {
				// new cross down
				candle.alerts.add(signalIndicatorNameCrossDown);
			}

			const inValueZone =
				curShort > curLong
					? candle.close >= curLong && candle.close <= curShort
					: candle.close <= curLong && candle.close >= curShort;

			if (inValueZone) {
				candle.alerts.add(EMACrossAnalyzer.ALERT_VALUE_ZONE);
			}
		});

		return candles;
	}
}
