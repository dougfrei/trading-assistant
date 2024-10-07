import {
	ETradeInstrumentType,
	IOptionTradePosition,
	IStockTradePosition
} from '@trading-assistant/common';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	calculateClosingPosition,
	getOptionTradeLegNetPositions,
	getStockTradeNetPosition,
	getTradePnL,
	isTradeAllSettled,
	optionTradeHasBrokenLeg
} from './trade-positions';

describe('Trade position utilities', () => {
	it('should calculate stock trade net long position correctly', () => {
		const netPosition = getStockTradeNetPosition([
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'buy 10 shares',
				quantity: 10
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 385.07,
				fees: 0,
				notes: 'sell 7 shares',
				quantity: -7
			}
		]);

		assert.equal(netPosition, 3);
	});

	it('should calculate stock trade net short position correctly', () => {
		const netPosition = getStockTradeNetPosition([
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: 542.2,
				fees: 0,
				notes: 'sell 10 shares',
				quantity: -10
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: -385.07,
				fees: 0,
				notes: 'buy 7 shares',
				quantity: 7
			}
		]);

		assert.equal(netPosition, -3);
	});

	it('should calculate stock trade net position closed correctly', () => {
		const netPosition = getStockTradeNetPosition([
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'buy 10 shares',
				quantity: 10
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'sell 10 shares',
				quantity: -10
			}
		]);

		assert.equal(netPosition, 0);
	});

	it('should calculate option trade net position closed correctly with single leg', () => {
		const netPosition = getOptionTradeLegNetPositions([
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'open 10 contracts',
				optionLegs: [
					{
						name: 'SPY240627C00555000',
						quantity: 10
					}
				]
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'sell 10 contracts',
				optionLegs: [
					{
						name: 'SPY240627C00555000',
						quantity: -10
					}
				]
			}
		]);

		assert.deepEqual(netPosition, {});
	});

	it('should calculate option trade net position closed correctly with spread', () => {
		const netPosition = getOptionTradeLegNetPositions([
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'open 10 call debit spreads',
				optionLegs: [
					{
						name: 'SPY240627C00555000', // long 555 strike
						quantity: 10
					},
					{
						name: 'SPY240627C00560000', // short 560 strike
						quantity: -10
					}
				]
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'close 10 call debit spreads',
				optionLegs: [
					{
						name: 'SPY240627C00555000', // sell 555 strike
						quantity: -10
					},
					{
						name: 'SPY240627C00560000', // buy back 560 strike
						quantity: 10
					}
				]
			}
		]);

		assert.deepEqual(netPosition, {});
	});

	it('should calculate option trade net position correctly with a broken leg spread', () => {
		const positions = [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'open 10 call debit spreads',
				optionLegs: [
					{
						name: 'SPY240627C00555000', // long 555 strike
						quantity: 10
					},
					{
						name: 'SPY240627C00560000', // short 560 strike
						quantity: -10
					}
				]
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'buy back the 560 strike and leave the 555 strike open',
				optionLegs: [
					{
						name: 'SPY240627C00560000', // buy back 560 strike
						quantity: 10
					}
				]
			}
		];

		const netPosition = getOptionTradeLegNetPositions(positions);

		assert.deepEqual(netPosition, {
			SPY240627C00555000: 10
		});
	});

	it('should correctly identify an options spread position with a broken leg', () => {
		const positions = [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'open 10 call debit spreads',
				optionLegs: [
					{
						name: 'SPY240627C00555000', // long 555 strike
						quantity: 10
					},
					{
						name: 'SPY240627C00560000', // short 560 strike
						quantity: -10
					}
				]
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'buy back the 560 strike and leave the 555 strike open',
				isDebit: false,
				optionLegs: [
					{
						name: 'SPY240627C00560000', // buy back 560 strike
						quantity: 10
					}
				]
			}
		];

		assert.equal(optionTradeHasBrokenLeg(positions), true);
	});

	it('should calculate stock trade net position closed correctly', () => {
		const netPosition = getTradePnL([
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'buy 10 shares',
				quantity: 10
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0.25,
				notes: 'sell 10 shares',
				quantity: -10
			}
		]);

		assert.equal(netPosition, 7.65);
	});

	it('should confirm that a stock trade is settled', () => {
		const isSettled = isTradeAllSettled(ETradeInstrumentType.STOCK, [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'buy 10 shares',
				quantity: 10
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'sell 10 shares',
				quantity: -10
			}
		]);

		assert.equal(isSettled, true);
	});

	it('should confirm that a stock trade is not settled', () => {
		const isSettled = isTradeAllSettled(ETradeInstrumentType.STOCK, [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'buy 10 shares',
				quantity: 10
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'sell 7 shares',
				quantity: -7
			}
		]);

		assert.equal(isSettled, false);
	});

	it('should confirm that an option trade is settled', () => {
		const isSettled = isTradeAllSettled(ETradeInstrumentType.OPTION, [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'open 10 call debit spreads',
				optionLegs: [
					{
						name: 'SPY240627C00555000', // long 555 strike
						quantity: 10
					},
					{
						name: 'SPY240627C00560000', // short 560 strike
						quantity: -10
					}
				]
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'close 10 call debit spreads',
				optionLegs: [
					{
						name: 'SPY240627C00555000', // sell 555 strike
						quantity: -10
					},
					{
						name: 'SPY240627C00560000', // buy back 560 strike
						quantity: 10
					}
				]
			}
		]);

		assert.equal(isSettled, true);
	});

	it('should confirm that an option trade is not settled', () => {
		const isSettled = isTradeAllSettled(ETradeInstrumentType.OPTION, [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'open 10 call debit spreads',
				optionLegs: [
					{
						name: 'SPY240627C00555000', // long 555 strike
						quantity: 10
					},
					{
						name: 'SPY240627C00560000', // short 560 strike
						quantity: -10
					}
				]
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'buy back the 560 strike and leave the 555 strike open',
				optionLegs: [
					{
						name: 'SPY240627C00560000', // buy back 560 strike
						quantity: 10
					}
				]
			}
		]);

		assert.equal(isSettled, false);
	});

	it('should return the correct stock quantity when calculating the closing position for trade', () => {
		const closingPosition = calculateClosingPosition(ETradeInstrumentType.STOCK, [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'buy 10 shares',
				quantity: 10
			}
		]);

		assert.equal((closingPosition as IStockTradePosition)?.quantity, -10);
	});

	it('should return the correct stock quantity when calculating the closing position for a multiple position trade', () => {
		const closingPosition = calculateClosingPosition(ETradeInstrumentType.STOCK, [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'buy 10 shares',
				quantity: 10
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'sell 7 shares',
				quantity: -7
			}
		]);

		assert.equal((closingPosition as IStockTradePosition)?.quantity, -3);
	});

	it('should return the correct option leg quantities when calculating the closing position for an option trade', () => {
		const closingPosition = calculateClosingPosition(ETradeInstrumentType.OPTION, [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'open 10 call debit spreads',
				optionLegs: [
					{
						name: 'SPY240627C00555000', // long 555 strike
						quantity: 10
					},
					{
						name: 'SPY240627C00560000', // short 560 strike
						quantity: -10
					}
				]
			}
		]);

		assert.equal(
			(closingPosition as IOptionTradePosition)?.optionLegs[0]?.name,
			'SPY240627C00555000'
		);
		assert.equal((closingPosition as IOptionTradePosition)?.optionLegs[0]?.quantity, -10);
		assert.equal(
			(closingPosition as IOptionTradePosition)?.optionLegs[1]?.name,
			'SPY240627C00560000'
		);
		assert.equal((closingPosition as IOptionTradePosition)?.optionLegs[1]?.quantity, 10);
	});

	it('should return null when calculating the closing position for a settled trade', () => {
		const closingPosition = calculateClosingPosition(ETradeInstrumentType.STOCK, [
			{
				id: '1',
				dateTime: '2024-02-15T14:23:00Z',
				totalAmount: -542.2,
				fees: 0,
				notes: 'buy 10 shares',
				quantity: 10
			},
			{
				id: '2',
				dateTime: '2024-02-15T15:36:00Z',
				totalAmount: 550.1,
				fees: 0,
				notes: 'sell 10 shares',
				quantity: -10
			}
		]);

		assert.equal(closingPosition, null);
	});
});
