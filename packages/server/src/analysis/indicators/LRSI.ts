import BaseIndicator from './BaseIndicator';

class LRSI extends BaseIndicator {
	protected prevLvalues = { L0: 0, L1: 0, L2: 0, L3: 0 };

	constructor(public gamma = 0.7) {
		super();
	}

	push(value: number) {
		const L0 = (1 - this.gamma) * value + this.gamma * this.prevLvalues.L0;
		const L1 = -this.gamma * L0 + this.prevLvalues.L0 + this.gamma * this.prevLvalues.L1;
		const L2 = -this.gamma * L1 + this.prevLvalues.L1 + this.gamma * this.prevLvalues.L2;
		const L3 = -this.gamma * L2 + this.prevLvalues.L2 + this.gamma * this.prevLvalues.L3;
		const cu = (L0 > L1 ? L0 - L1 : 0) + (L1 > L2 ? L1 - L2 : 0) + (L2 > L3 ? L2 - L3 : 0);
		const cd = (L0 < L1 ? L1 - L0 : 0) + (L1 < L2 ? L2 - L1 : 0) + (L2 < L3 ? L3 - L2 : 0);

		const lrsiValue = cu + cd !== 0 ? cu / (cu + cd) : 0;

		this.prevLvalues = {
			L0,
			L1,
			L2,
			L3
		};

		return this.getFormattedValue(lrsiValue);
	}

	reset() {
		this.prevLvalues = { L0: 0, L1: 0, L2: 0, L3: 0 };
	}
}

export default LRSI;
