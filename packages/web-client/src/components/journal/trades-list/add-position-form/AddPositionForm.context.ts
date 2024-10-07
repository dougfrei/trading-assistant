import { createFormContext } from '@mantine/form';
import IOptionEditorLegValues from '@src/interfaces/IOptionEditorLegValues';

export interface IAddPositionFormValues {
	stockValues: {
		action: 'buy' | 'sell';
		quantity: number;
	};
	optionLegs: IOptionEditorLegValues[];
	newPosition: {
		dateTime: Date;
		netEffect: 'debit' | 'credit';
		price: number;
		fees: number;
	};
}

export const [AddPositionFormProvider, useAddPositionFormContext, useAddPositionForm] =
	createFormContext<IAddPositionFormValues>();
