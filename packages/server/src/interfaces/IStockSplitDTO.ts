import { valibotSchemas } from 'src/util/valibot';
import * as v from 'valibot';

interface IStockSplitDTO {
	tickerSymbol: string;
	from: number;
	to: number;
	executionDate: Date;
}

export const validStockSplitDTO = v.object({
	tickerSymbol: valibotSchemas.nonEmptyString('ticker symbol is empty'),
	from: v.pipe(v.number(), v.integer(), v.finite()),
	to: v.pipe(v.number(), v.integer(), v.finite()),
	executionDate: v.date()
});

export default IStockSplitDTO;
