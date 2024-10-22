import BaseIndicator from './BaseIndicator';
import SMA from './SMA';

class WEMA extends BaseIndicator {
	protected sma: SMA;
	protected exponent = 0;
	protected prevValue: number | null = null;

	constructor(public period: number) {
		super();

		this.sma = new SMA(period);
		this.exponent = 1 / period;
	}

	push(value: number) {
		if (this.prevValue === null) {
			this.prevValue = this.sma.push(value);
		} else {
			this.prevValue = (value - this.prevValue) * this.exponent + this.prevValue;
		}

		return this.getFormattedValue(this.prevValue);
	}

	reset() {
		this.sma.reset();
		this.prevValue = null;
	}
}

export default WEMA;
