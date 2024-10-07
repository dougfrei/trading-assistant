import { ETradeInstrumentType } from '@trading-assistant/common';

export interface ITradeInstrument {
	name: ETradeInstrumentType;
	label: string;
}

export const tradeInstruments: ITradeInstrument[] = [
	{
		name: ETradeInstrumentType.STOCK,
		label: 'Stock'
	},
	{
		name: ETradeInstrumentType.OPTION,
		label: 'Option'
	},
	{
		name: ETradeInstrumentType.FUTURES,
		label: 'Futures'
	},
	{
		name: ETradeInstrumentType.CRYPTO,
		label: 'Crypto'
	}
];

export const tradeInstrumentsMapByName = new Map(tradeInstruments.map((inst) => [inst.name, inst]));
