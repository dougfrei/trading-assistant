import BaseIndicator from './BaseIndicator';

class TrueRange extends BaseIndicator {
	protected prevClose: number | null = null;

	push({ low, high, close }: { low: number; high: number; close: number }) {
		if (this.prevClose === null) {
			this.prevClose = close;

			return null;
		}

		const result = Math.max(
			high - low,
			isNaN(Math.abs(high - this.prevClose)) ? 0 : Math.abs(high - this.prevClose),
			isNaN(Math.abs(low - this.prevClose)) ? 0 : Math.abs(low - this.prevClose)
		);

		this.prevClose = close;

		return this.getFormattedValue(result);
	}

	reset() {
		this.prevClose = null;
	}
}

export default TrueRange;
