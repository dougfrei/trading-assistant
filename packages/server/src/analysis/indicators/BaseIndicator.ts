type TFormatterCallback = (value: number | null) => number | null;

class BaseIndicator {
	protected formatter: TFormatterCallback | null = null;

	reset() {
		throw new Error('reset method not implemented for indicator');
	}

	applyFormatter(formatter: TFormatterCallback) {
		this.formatter = formatter;
	}

	protected getFormattedValue(value: number | null) {
		return this.formatter ? this.formatter(value) : value;
	}
}

export default BaseIndicator;
