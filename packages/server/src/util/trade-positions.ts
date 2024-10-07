import {
	IOptionLeg,
	IOptionTradePosition,
	IStockTradePosition,
	TTradePosition,
	optionTradePositionSchema,
	stockTradePositionSchema
} from '@trading-assistant/common';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { nanoid } from 'nanoid';
import * as v from 'valibot';
import { percentChange, twoDecimals } from './math';

/**
 * Validate a trade positions array to ensure that all elements are IStockTradePosition objects
 *
 * @param positions An array of trade positions
 * @returns The input array validated to ensure that every item is a IStockTradePosition object
 */
export function getValidatedStockTradePositions(
	positions: TTradePosition[]
): IStockTradePosition[] {
	return v.parse(v.array(stockTradePositionSchema), positions);
}

/**
 * Validate a trade positions array to ensure that all elements are IOptionTradePosition objects
 *
 * @param positions An array of trade positions
 * @returns The input array validated to ensure that every item is a IOptionTradePosition object
 */
export function getValidatedOptionTradePositions(
	positions: TTradePosition[]
): IOptionTradePosition[] {
	return v.parse(v.array(optionTradePositionSchema), positions);
}

/**
 * Calculate the net position for a stock trade based on the provided position
 * history
 *
 * @param positions An array of IStockTradePosition objects
 * @returns The net position value
 */
export function getStockTradeNetPosition(positions: IStockTradePosition[]) {
	return positions.reduce((acum, pos) => acum + pos.quantity, 0);
}

/**
 * Calculate the net position values for an option trade based on the provided
 * position history. This method differs from getStockTradeNetPosition in that
 * it returns an array containing keys of each option name included in the trade
 * with their respective net positions.
 *
 * @param positions An array of IOptionTradePosition objects
 * @returns An object with option names keyed to their respective net positions
 */
export function getOptionTradeLegNetPositions(positions: IOptionTradePosition[]) {
	const qtyByOptionName = positions.reduce<Record<string, number>>((acum, position) => {
		position.optionLegs.forEach((leg) => {
			acum[leg.name] = (acum[leg.name] ?? 0) + leg.quantity;
		});

		return acum;
	}, {});

	const validLegs = Object.keys(qtyByOptionName).reduce<Record<string, number>>(
		(acum, legKey) => {
			if (qtyByOptionName[legKey] !== 0) {
				acum[legKey] = qtyByOptionName[legKey];
			}

			return acum;
		},
		{}
	);

	return validLegs;
}

/**
 * Calculate the profit/loss of a trade based on the provided trade positions
 *
 * @param positions An array of trade position objects
 * @param params Optional parameters
 * @returns The resulting profit/loss based on the trade positions
 */
export function getTradePnL(
	positions: TTradePosition[],
	{ excludeFees = false }: { excludeFees?: boolean } = {}
) {
	const pnl = positions.reduce((runningPnL, pos) => {
		runningPnL = twoDecimals(runningPnL + pos.totalAmount);

		if (!excludeFees && pos.fees) {
			runningPnL = twoDecimals(runningPnL - (pos.fees ?? 0));
		}

		return runningPnL;
	}, 0);

	return twoDecimals(pnl);
}

/**
 * Calculate the profit/loss percentage of a trade based on the provided trade
 * positions
 *
 * @param instrumentType The trade instrument type
 * @param positions An array of trade positions
 * @returns The resulting profit/loss percentage based on the trade positions
 */
export function getTradePnLPercent(
	instrumentType: ETradeInstrumentType,
	positions: TTradePosition[]
) {
	if (positions.length < 2 || !isTradeAllSettled(instrumentType, positions)) {
		return 0;
	}

	const totals = positions.reduce(
		(acum, position) => {
			if (position.totalAmount > 0) {
				acum.credits = acum.credits + position.totalAmount;
			} else {
				acum.debits = acum.debits + Math.abs(position.totalAmount);
			}

			acum.debits = acum.debits + Math.abs(position.fees ?? 0);

			return acum;
		},
		{ credits: 0, debits: 0 }
	);

	return percentChange(totals.debits, totals.credits, 2);
}

/**
 * Calculate if the provided positions result in a scratch. A scratch would be
 * considered a PnL value of 0 or if the trade is a loss and the loss value is
 * equal to the total fees.
 *
 * @returns A boolean indicating that the provided positions result in a scratch
 */
export function getTradeIsScratch(positions: TTradePosition[]) {
	const pnl = getTradePnL(positions, { excludeFees: true });

	if (pnl === 0) {
		return true;
	}

	const totalFees = positions.reduce((total, pos) => total + (pos.fees ?? 0), 0);

	return pnl === totalFees * -1;
}

/**
 * Check if an option trade positions result in a "broken leg". A broken leg is
 * a mis-matched spread trade in terms of quantity that occurs after establishing
 * the initial position by selling or buying back any leg independently of the
 * others.
 *
 * @param positions An array of option trade positions
 * @returns boolean indicating that the trade has a broken leg
 */
export function optionTradeHasBrokenLeg(positions: IOptionTradePosition[]) {
	const qtyByOptionName = positions.reduce((acum, position) => {
		position.optionLegs.forEach((leg) => {
			acum.set(leg.name, (acum.get(leg.name) ?? 0) + leg.quantity);
		});

		return acum;
	}, new Map<string, number>());

	// If there are less than two unique option names used in the positions, it
	// wouldn't be possible for the trade to have a broken leg
	if (Array.from(qtyByOptionName.keys()).length < 2) {
		return false;
	}

	const legNames = Array.from(qtyByOptionName.keys());
	let lastValue: number | null = null;

	// If a spread trade is balanced and doesn't have a broken leg, all option names
	// will have net positions with absolute values that are identical to each other.
	// If there is a mismatch between any of them, it indicates a broken leg.
	for (const legName of legNames) {
		const curValue = Math.abs(Number(qtyByOptionName.get(legName)));

		if (typeof lastValue === 'number' && curValue !== lastValue) {
			return true;
		}

		lastValue = curValue;
	}

	return false;
}

/**
 * Check if a trade has a net position of zero and should be considered settled/closed
 * based on its position history
 *
 * @param instrumentType The trade instrument type
 * @param positions An array of trade positions
 * @returns A boolean indicating that the trade is settled with a net position of zero
 */
export function isTradeAllSettled(
	instrumentType: ETradeInstrumentType,
	positions: TTradePosition[]
) {
	switch (instrumentType) {
		case ETradeInstrumentType.STOCK: {
			return getStockTradeNetPosition(positions as IStockTradePosition[]) === 0;
		}

		case ETradeInstrumentType.OPTION: {
			const optionLegs = getOptionTradeLegNetPositions(positions as IOptionTradePosition[]);

			for (const legKey in optionLegs) {
				if (optionLegs[legKey] !== 0) {
					return false;
				}
			}

			return true;
		}

		default:
			break;
	}

	return false;
}

/**
 * Return a position object representing the position change(s) necessary to bring
 * the trade to a net zero quantity state
 *
 * @param instrumentType The trade instrument type
 * @param positions An array of trade positions
 * @returns The calculated closing position or null if the trade has a net position of zero and should be treated as closed
 */
export function calculateClosingPosition(
	instrumentType: ETradeInstrumentType,
	positions: TTradePosition[]
) {
	if (isTradeAllSettled(instrumentType, positions)) {
		return null;
	}

	switch (instrumentType) {
		case ETradeInstrumentType.STOCK: {
			const netPos = getStockTradeNetPosition(positions as IStockTradePosition[]);

			const closingPosition: IStockTradePosition = {
				id: nanoid(),
				dateTime: new Date().toISOString(),
				totalAmount: 0,
				fees: 0,
				notes: '',
				quantity: netPos > 0 ? netPos * -1 : Math.abs(netPos)
			};

			return closingPosition;
		}

		case ETradeInstrumentType.OPTION: {
			const legNetPositions = getOptionTradeLegNetPositions(
				positions as IOptionTradePosition[]
			);

			if (!Object.keys(legNetPositions).length) {
				return null;
			}

			const closingOptionLegs = Object.keys(legNetPositions).reduce<IOptionLeg[]>(
				(acum, legKey) => {
					const netPos = legNetPositions[legKey];

					if (netPos === 0) {
						return acum;
					}

					acum.push({
						name: legKey,
						quantity: netPos > 0 ? netPos * -1 : Math.abs(netPos)
					});

					return acum;
				},
				[]
			);

			const closingPosition: IOptionTradePosition = {
				id: nanoid(),
				dateTime: new Date().toISOString(),
				totalAmount: 0,
				fees: 0,
				notes: '',
				optionLegs: closingOptionLegs
			};

			return closingPosition;
		}

		default:
			break;
	}

	return null;
}
