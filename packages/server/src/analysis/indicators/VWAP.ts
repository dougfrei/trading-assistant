import BaseIndicator from './BaseIndicator';

class VWAP extends BaseIndicator {
	protected cumulativeTotal = 0;
	protected cumulativeVolume = 0;

	push({
		open,
		high,
		low,
		close,
		volume
	}: {
		open?: number;
		high: number;
		low: number;
		close: number;
		volume: number;
	}) {
		const typicalPrice =
			typeof open === 'number' ? (open + high + low + close) / 4 : (high + low + close) / 3;
		const total = volume * typicalPrice;

		this.cumulativeTotal = this.cumulativeTotal + total;
		this.cumulativeVolume = this.cumulativeVolume + volume;

		return this.getFormattedValue(this.cumulativeTotal / this.cumulativeVolume);
	}

	reset() {
		this.cumulativeTotal = 0;
		this.cumulativeVolume = 0;
	}
}

export default VWAP;
