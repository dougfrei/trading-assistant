import { Candle } from 'src/entities/Candle.model';
import { ICandleAnalyzerIndicatorType } from 'src/interfaces/ICandleAnalyzer';
import { arrayFillToMinLength } from 'src/util/arrays';
import { twoDecimals } from 'src/util/math';
import { ATR } from 'technicalindicators';
import BaseAnalyzer from '../BaseAnalyzer';

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
		const atrValues = arrayFillToMinLength(
			ATR.calculate({
				period: this.period,
				high: candles.map((candle) => candle.high),
				low: candles.map((candle) => candle.low),
				close: candles.map((candle) => candle.close)
			}),
			candles.length
		);

		return candles.map((candle, index) => {
			candle.indicators.set(
				ATRAnalyzer.ATR_INDICATOR_KEY,
				typeof atrValues[index] === 'number' ? twoDecimals(atrValues[index]) : null
			);

			return candle;
		});
	}
}
