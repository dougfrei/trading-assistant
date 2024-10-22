import { Candle } from 'src/entities/Candle.model';
import { ICandleAnalyzerIndicatorType } from 'src/interfaces/ICandleAnalyzer';
import { isCandleIndicatorNumericValue } from 'src/util/candle';
import { twoDecimals } from 'src/util/math';
import BaseAnalyzer from '../BaseAnalyzer';
import ATR from '../indicators/ATR';

interface IATRAnalyzerParams {
	period?: number;
}

export class ATRAnalyzer extends BaseAnalyzer {
	static readonly ATR_INDICATOR_KEY = 'atr';

	protected period = 14;

	constructor({ period = 14 }: IATRAnalyzerParams = {}) {
		super();

		this.period = period;
	}

	getIndicatorTypes(): ICandleAnalyzerIndicatorType[] {
		return [
			{
				key: ATRAnalyzer.ATR_INDICATOR_KEY,
				label: `Average True Range (${this.period})`
			}
		];
	}

	getMinimumRequiredCandles() {
		return this.period + 1;
	}

	analyze(candles: Candle[]): Candle[] {
		const atr = new ATR(this.period);
		atr.applyFormatter((value) =>
			isCandleIndicatorNumericValue(value) ? twoDecimals(value) : value
		);

		return candles.map((candle) => {
			const atrValue = atr.push({ high: candle.high, low: candle.low, close: candle.close });

			candle.indicators.set(ATRAnalyzer.ATR_INDICATOR_KEY, atrValue);

			return candle;
		});
	}
}
