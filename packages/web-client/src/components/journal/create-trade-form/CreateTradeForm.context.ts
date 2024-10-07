import { createFormContext } from '@mantine/form';
import { IGqlTradePriceLevel } from '@src/interfaces/IGqlResponses';
import IOptionEditorLegValues from '@src/interfaces/IOptionEditorLegValues';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';

export interface ICreateTradeFormValues {
	accountId: string;
	instrumentName: ETradeInstrumentType | null;
	tickerSymbol: string;
	stockValues: {
		side: 'long' | 'short';
		quantity: number;
	};
	optionSpreadTemplate: string;
	optionLegs: IOptionEditorLegValues[];
	initialPosition: {
		dateTime: Date;
		netEffect: 'debit' | 'credit';
		price: number;
		fees: number;
	};
	notes: string;
	stopLosses: IGqlTradePriceLevel[];
	profitTargets: IGqlTradePriceLevel[];
	setupTagIds: number[];
}

export const [CreateTradeFormProvider, useCreateTradeFormContext, useCreateTradeForm] =
	createFormContext<ICreateTradeFormValues>();
