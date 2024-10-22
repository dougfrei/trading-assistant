import BaseIndicator from './BaseIndicator';
import TrueRange from './TrueRange';
import WEMA from './WEMA';

class ATR extends BaseIndicator {
	protected trueRangeValues: TrueRange;
	protected wemaValues: WEMA;

	constructor(public period: number) {
		super();

		this.trueRangeValues = new TrueRange();
		this.wemaValues = new WEMA(period);
	}

	push({ high, low, close }: { high: number; low: number; close: number }) {
		const trueRange = this.trueRangeValues.push({ high, low, close });

		return this.getFormattedValue(trueRange === null ? null : this.wemaValues.push(trueRange));
	}

	reset() {
		this.trueRangeValues.reset();
		this.wemaValues.reset();
	}
}

export default ATR;
