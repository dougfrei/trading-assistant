import ICandle from '@src/interfaces/ICandle';
import { timestampToSeconds } from '@trading-assistant/common/util';
import { LineStyle } from 'lightweight-charts';
import { UTCTimestamp } from 'lightweight-charts';

/**
 * Return a candle period value formatted in seconds for use by Lightweight Charts
 *
 * @param candle ICandle object
 * @returns The candle period value formatted in seconds
 */
export function getChartTimeFromCandle(candle: ICandle) {
	return timestampToSeconds(candle.period) as UTCTimestamp;
}

/**
 * Return a LineStyle value used by Lightweight Charts for the provided string value
 *
 * @param value String value
 * @returns LineStyle value
 */
export function getLineStyleForStringValue(value: string) {
	switch (value.trim().toLowerCase()) {
		case 'solid':
			return LineStyle.Solid;

		case 'dotted':
			return LineStyle.Dotted;

		case 'dashed':
			return LineStyle.Dashed;

		case 'large-dashed':
			return LineStyle.LargeDashed;

		case 'sparse-dotted':
			return LineStyle.SparseDotted;

		default:
			break;
	}

	return LineStyle.Solid;
}
