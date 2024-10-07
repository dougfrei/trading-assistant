import EPositionAdjustType from '../enums/EPositionAdjustType';

interface ITradePosition {
	id: string;
	dateTime: Date;
	side: EPositionAdjustType;
	quantity: number;
	price: number;
	fees: number;
}

export default ITradePosition;
