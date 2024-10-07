function calculateLRSI(values: number[], params: { gamma?: number } = {}): number[] {
	const { gamma = 0.7 } = params;

	let prevLvalues = {
		L0: 0,
		L1: 0,
		L2: 0,
		L3: 0
	};

	const res = values.map((value) => {
		const L0 = (1 - gamma) * value + gamma * prevLvalues.L0;
		const L1 = -gamma * L0 + prevLvalues.L0 + gamma * prevLvalues.L1;
		const L2 = -gamma * L1 + prevLvalues.L1 + gamma * prevLvalues.L2;
		const L3 = -gamma * L2 + prevLvalues.L2 + gamma * prevLvalues.L3;
		const cu = (L0 > L1 ? L0 - L1 : 0) + (L1 > L2 ? L1 - L2 : 0) + (L2 > L3 ? L2 - L3 : 0);
		const cd = (L0 < L1 ? L1 - L0 : 0) + (L1 < L2 ? L2 - L1 : 0) + (L2 < L3 ? L3 - L2 : 0);

		const LRSI = cu + cd !== 0 ? cu / (cu + cd) : 0;

		prevLvalues = {
			L0,
			L1,
			L2,
			L3
		};

		return LRSI;
	});

	return res;
}

export default calculateLRSI;

/* abstract class LRSI {
	public static calculate(params: { values: number[]; gamma?: number }): number[] {
		const { values, gamma = 0.7 } = params;

		let prevLvalues = {
			L0: 0,
			L1: 0,
			L2: 0,
			L3: 0
		};

		const res = values.map((value) => {
			const L0 = (1 - gamma) * value + gamma * prevLvalues.L0;
			const L1 = -gamma * L0 + prevLvalues.L0 + gamma * prevLvalues.L1;
			const L2 = -gamma * L1 + prevLvalues.L1 + gamma * prevLvalues.L2;
			const L3 = -gamma * L2 + prevLvalues.L2 + gamma * prevLvalues.L3;
			const cu = (L0 > L1 ? L0 - L1 : 0) + (L1 > L2 ? L1 - L2 : 0) + (L2 > L3 ? L2 - L3 : 0);
			const cd = (L0 < L1 ? L1 - L0 : 0) + (L1 < L2 ? L2 - L1 : 0) + (L2 < L3 ? L3 - L2 : 0);

			const LRSI = cu + cd !== 0 ? cu / (cu + cd) : 0;

			prevLvalues = {
				L0,
				L1,
				L2,
				L3
			};

			return LRSI;
		});

		return res;
	}
}

export default LRSI; */
