import { Candle } from 'src/entities/Candle.model';
import { ICandleAnalyzerIndicatorType } from 'src/interfaces/ICandleAnalyzer';
import { arrayFillToMinLength } from 'src/util/arrays';
import { isCandleIndicatorNumericValue } from 'src/util/candle';
import { twoDecimals } from 'src/util/math';
import { SMA } from 'technicalindicators';
import BaseAnalyzer from '../BaseAnalyzer';

interface IRVolAnalyzerParams {
	period?: number;
	highThreshold?: number;
}

export class RVolAnalyzer extends BaseAnalyzer {
	static readonly INDICATOR_KEY_RVOL = 'rvol';
	static readonly INDICATOR_KEY_VOL_SMA = 'vol_sma';
	// static readonly TEMP_SD_INDICATOR_KEY = '_rvol_sd';

	// static readonly ALERT_HIGH_RVOL = 'rvol_high';

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
		const smaValues = arrayFillToMinLength(
			SMA.calculate({
				period: this.period,
				values: candles.map((candle) => candle.volume)
			}),
			candles.length
		);

		// const sdValues = arrayFillToMinLength(
		// 	SD.calculate({
		// 		period: this.params.period,
		// 		values: candles.map((candle) => candle.volume)
		// 	}),
		// 	candles.length
		// );

		return candles.map((candle, index) => {
			candle.indicators.set(
				RVolAnalyzer.INDICATOR_KEY_VOL_SMA,
				smaValues[index] !== null ? Math.round(smaValues[index]) : null
			);

			// candle.indicators.set(
			// 	RVolAnalyzer.TEMP_SD_INDICATOR_KEY,
			// 	sdValues[index] !== null ? twoDecimals(sdValues[index]) : null
			// );

			let rvolValue: number | null = null;

			// cur vol / sma vol

			const smaValue = candle.indicators.get(RVolAnalyzer.INDICATOR_KEY_VOL_SMA);

			if (isCandleIndicatorNumericValue(smaValue)) {
				rvolValue = twoDecimals(candle.volume / smaValue);
			}

			// const sdValue = candle.indicators.get(RVolAnalyzer.TEMP_SD_INDICATOR_KEY);

			// if (isCandleIndicatorNumericValue(smaValue) && isCandleIndicatorNumericValue(sdValue)) {
			// 	rvolValue = sdValue === 0 ? 0 : twoDecimals((candle.volume - smaValue) / sdValue);

			// 	// if (rvolValue >= 1) {
			// 	// 	candle.alerts.add(RVolAnalyzer.ALERT_HIGH_RVOL);
			// 	// }
			// }

			candle.indicators.set(RVolAnalyzer.INDICATOR_KEY_RVOL, rvolValue);

			// cleanup
			// candle.indicators.delete(RVolAnalyzer.TEMP_SD_INDICATOR_KEY);

			return candle;
		});
	}
}
