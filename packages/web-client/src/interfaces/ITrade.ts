import ITradeOptionsValues from './ITradeOptionsValues';
import ITradePosition from './ITradePosition';

interface ITrade {
	accountId: number;
	instrumentName: string;
	tickerSymbol: string;
	optionValues: ITradeOptionsValues | null;
	setupIds: number[];
	issueIds: number[];
	profitTargets: number[];
	stopLosses: number[];
	positions: ITradePosition[];
	openNotes: string;
	closeNotes: string;
	isClosed: boolean;
}

export default ITrade;
