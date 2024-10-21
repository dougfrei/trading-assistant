class SimpleMovingAverage {
	protected computeValues: number[] = [];

	constructor(public length: number) {}

	push(value: number) {
		this.computeValues.push(value);

		if (this.computeValues.length > this.length) {
			this.computeValues.shift();
		}

		return this.computeValues.length >= this.length
			? this.computeValues.reduce((acum, value) => acum + value) / this.length
			: null;
	}
}

export default SimpleMovingAverage;
