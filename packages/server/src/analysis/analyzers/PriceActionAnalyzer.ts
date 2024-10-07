import { Candle } from 'src/entities/Candle.model';
import {
	ECandleAnalyzerAlertSentiment,
	ICandleAnalyzerAlertType
} from 'src/interfaces/ICandleAnalyzer';
import { bearishhammerstick, bullishhammerstick } from 'technicalindicators';
import BaseAnalyzer from '../BaseAnalyzer';

export class PriceActionAnalyzer extends BaseAnalyzer {
	static readonly ALERT_BEAR_HAMMER = 'pa_bear_hammer';
	static readonly ALERT_BULL_HAMMER = 'pa_bull_hammer';
	static readonly ALERT_BEAR_HAMMER_VOLUME_INCREASE = 'pa_bear_hammer_volume_increase';
	static readonly ALERT_BULL_HAMMER_VOLUME_INCREASE = 'pa_bull_hammer_volume_increase';
	static readonly ALERT_II_PATTERN = 'pa_ii_pattern';
	static readonly ALERT_OO_PATTERN = 'pa_oo_pattern';

	getAlertTypes(): ICandleAnalyzerAlertType[] {
		return [
			{
				key: PriceActionAnalyzer.ALERT_BEAR_HAMMER,
				label: 'Bear Hammer',
				sentiment: ECandleAnalyzerAlertSentiment.BEARISH
			},
			{
				key: PriceActionAnalyzer.ALERT_BULL_HAMMER,
				label: 'Bull Hammer',
				sentiment: ECandleAnalyzerAlertSentiment.BULLISH
			},
			{
				key: PriceActionAnalyzer.ALERT_BEAR_HAMMER_VOLUME_INCREASE,
				label: 'Bear Hammer on increasing volume',
				sentiment: ECandleAnalyzerAlertSentiment.BEARISH
			},
			{
				key: PriceActionAnalyzer.ALERT_BULL_HAMMER_VOLUME_INCREASE,
				label: 'Bull Hammer on increasing volume',
				sentiment: ECandleAnalyzerAlertSentiment.BULLISH
			},
			{
				key: PriceActionAnalyzer.ALERT_II_PATTERN,
				label: 'II candle pattern',
				sentiment: ECandleAnalyzerAlertSentiment.NEUTRAL
			},
			{
				key: PriceActionAnalyzer.ALERT_OO_PATTERN,
				label: 'OO candle pattern',
				sentiment: ECandleAnalyzerAlertSentiment.NEUTRAL
			}
		];
	}

	getMinimumRequiredCandles(): number {
		return 3;
	}

	analyze(candles: Candle[]): Candle[] {
		candles.forEach((candle, index, allCandles) => {
			const isBearishHammer = bearishhammerstick({
				open: [candle.open],
				high: [candle.high],
				low: [candle.low],
				close: [candle.close]
			});

			const isBullishHammer = bullishhammerstick({
				open: [candle.open],
				high: [candle.high],
				low: [candle.low],
				close: [candle.close]
			});

			const isVolumeIncrease =
				allCandles[index - 1] && candle.volume > allCandles[index - 1].volume;

			if (isBearishHammer) {
				candle.alerts.add(PriceActionAnalyzer.ALERT_BEAR_HAMMER);

				if (isVolumeIncrease) {
					candle.alerts.add(PriceActionAnalyzer.ALERT_BEAR_HAMMER_VOLUME_INCREASE);
				}
			}

			if (isBullishHammer) {
				candle.alerts.add(PriceActionAnalyzer.ALERT_BULL_HAMMER);

				if (isVolumeIncrease) {
					candle.alerts.add(PriceActionAnalyzer.ALERT_BULL_HAMMER_VOLUME_INCREASE);
				}
			}

			// a minimum of three candles are needed for II and OO patterns
			if (index < 2) {
				return;
			}

			if (
				allCandles[index - 1].high <= allCandles[index - 2].high &&
				allCandles[index - 1].low >= allCandles[index - 2].low &&
				candle.high <= allCandles[index - 1].high &&
				candle.low >= allCandles[index - 1].low
			) {
				candle.alerts.add(PriceActionAnalyzer.ALERT_II_PATTERN);
			} else if (
				allCandles[index - 1].high >= allCandles[index - 2].high &&
				allCandles[index - 1].low <= allCandles[index - 2].low &&
				candle.high >= allCandles[index - 1].high &&
				candle.low <= allCandles[index - 1].low
			) {
				candle.alerts.add(PriceActionAnalyzer.ALERT_OO_PATTERN);
			}
		});

		return candles;
	}
}
