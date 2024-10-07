import ITradeOptionsValuesLeg from './ITradeOptionsValuesLeg';

interface ITradeOptionsValues {
	typeId: number;
	legs: ITradeOptionsValuesLeg[];
}

export default ITradeOptionsValues;
