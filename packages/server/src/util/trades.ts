import { twoDecimals } from 'src/util/math';

/**
 * Calculate the win rate from the provided number of winning and losing trades
 *
 * @param numWinners The number of winning trades
 * @param numLosers The number of losing trades
 * @returns The calculated win rate
 */
export function calculateWinRate(numWinners: number, numLosers: number): number {
	if (numWinners && !numLosers) {
		return 100;
	}

	if (!numWinners && numLosers) {
		return 0;
	}

	return twoDecimals((numWinners / (numLosers + numWinners)) * 100);
}

/**
 * Calculate the profit factor from the provided array of profit/loss values
 *
 * @param pnlValues An array of profit/loss values
 * @returns The calculated profit factor
 */
export function calculateProfitFactor(pnlValues: number[]): number {
	const totalProfit = pnlValues.reduce((acum, value) => (value > 0 ? acum + value : acum), 0);
	const totalLoss = pnlValues.reduce(
		(acum, value) => (value < 0 ? acum + Math.abs(value) : acum),
		0
	);

	if (totalProfit && !totalLoss) {
		return -1; // TODO: how should profit factor for a period with no loss be calculated?
	}

	const pf = twoDecimals(totalProfit / totalLoss);

	if (pf < 0 && pf !== -1) {
		console.log({
			totalProfit,
			totalLoss,
			pf
		});
	}

	return pf;
}
