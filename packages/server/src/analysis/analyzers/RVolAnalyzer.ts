import { Candle } from 'src/entities/Candle.model';
import { ICandleAnalyzerIndicatorType } from 'src/interfaces/ICandleAnalyzer';
import { isCandleIndicatorNumericValue } from 'src/util/candle';
import { twoDecimals } from 'src/util/math';
import BaseAnalyzer from '../BaseAnalyzer';
import SMA from '../indicators/SMA';

interface IRVolAnalyzerParams {
	period?: number;
	highThreshold?: number;
}

export class RVolAnalyzer extends BaseAnalyzer {
	static readonly INDICATOR_KEY_RVOL = 'rvol';
	static readonly INDICATOR_KEY_VOL_SMA = 'vol_sma';

	protected period = 60;
	protected highThreshold = 1;

	constructor(params: IRVolAnalyzerParams = {}) {
		super();

		this.period = params.period ?? 60;
		this.highThreshold = params.highThreshold ?? 1;
	}

	getIndicatorTypes(): ICandleAnalyzerIndicatorType[] {
		return [
			{
				key: RVolAnalyzer.INDICATOR_KEY_RVOL,
				label: `Relative Volume (${this.period})`
			}
		];
	}

	getMinimumRequiredCandles() {
		return this.period + 1;
	}

	analyze(candles: Candle[]): Candle[] {
		const sma = new SMA(this.period);
		sma.applyFormatter((value) =>
			isCandleIndicatorNumericValue(value) ? Math.round(value) : value
		);

		return candles.map((candle) => {
			const smaValue = sma.push(candle.volume);
			let rvolValue: number | null = null;

			candle.indicators.set(RVolAnalyzer.INDICATOR_KEY_VOL_SMA, smaValue);

			if (isCandleIndicatorNumericValue(smaValue)) {
				rvolValue = twoDecimals(candle.volume / smaValue);
			}

			candle.indicators.set(RVolAnalyzer.INDICATOR_KEY_RVOL, rvolValue);

			return candle;
		});
	}
}
