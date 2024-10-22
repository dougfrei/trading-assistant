import BaseIndicator from './BaseIndicator';

class SMA extends BaseIndicator {
	protected computeValues: number[] = [];

	constructor(public period: number) {
		super();
	}

	push(value: number) {
		this.computeValues.push(value);

		if (this.computeValues.length > this.period) {
			this.computeValues.shift();
		}

		return this.getFormattedValue(
			this.computeValues.length >= this.period
				? this.computeValues.reduce((acum, value) => acum + value) / this.period
				: null
		);
	}

	reset() {
		this.computeValues = [];
	}
}

export default SMA;
