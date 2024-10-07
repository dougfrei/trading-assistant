import { twoDecimals } from 'src/util/math';

function calculateVwapOhlc4(params: {
	open: number[];
	high: number[];
	low: number[];
	close: number[];
	volume: number[];
	twoDecimals?: boolean;
}): number[] {
	if (
		params.open.length !== params.high.length ||
		params.high.length !== params.low.length ||
		params.low.length !== params.close.length ||
		params.close.length !== params.volume.length
	) {
		throw new Error(
			'vwapOHLC4: open, high, low, close, and volume arrays must be the same length'
		);
	}

	const results: number[] = [];

	const generator = (function* (): IterableIterator<number | undefined> {
		let tick = yield;
		let cumulativeTotal = 0;
		let cumulativeVolume = 0;

		while (true) {
			const typicalPrice = (tick.open + tick.high + tick.low + tick.close) / 4;
			const total = tick.volume * typicalPrice;
			cumulativeTotal = cumulativeTotal + total;
			cumulativeVolume = cumulativeVolume + tick.volume;
			tick = yield cumulativeTotal / cumulativeVolume;
		}
	})();

	generator.next();

	params.volume.forEach((tick, index) => {
		const result = generator.next({
			open: params.open[index],
			high: params.high[index],
			low: params.low[index],
			close: params.close[index],
			volume: params.volume[index]
		});

		if (typeof result.value !== 'undefined') {
			results.push(params.twoDecimals ? twoDecimals(result.value) : result.value);
		}
	});

	return results;
}

export default calculateVwapOhlc4;
