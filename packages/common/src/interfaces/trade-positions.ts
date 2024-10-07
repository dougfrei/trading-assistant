export interface IOptionLeg {
	name: string;
	quantity: number;
}

export interface ITradePosition {
	id: string;
	dateTime: string;
	totalAmount: number;
	fees?: number;
	notes?: string;
}

export interface IStockTradePosition extends ITradePosition {
	quantity: number;
}

export interface IOptionTradePosition extends ITradePosition {
	optionLegs: IOptionLeg[];
}

export type TTradePosition = IStockTradePosition | IOptionTradePosition;
export type TTradePositionCreatable = Omit<IStockTradePosition, 'id'> | Omit<IOptionTradePosition, 'id'>;
