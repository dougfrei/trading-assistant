import { valibotSchemas } from 'src/util/valibot';
import * as v from 'valibot';

interface IEarningsDTO {
	date: Date;
	tickerSymbol: string;
	eps: number | null;
	epsEstimated: number | null;
	revenue: number | null;
	revenueEstimated: number | null;
	announceTime: 'bmo' | 'amc';
	fiscalDateEnding: Date;
	updatedFromDate: Date;
}

export const validEarningsDTO = v.object({
	date: v.date(),
	tickerSymbol: valibotSchemas.nonEmptyString('ticker symbol is empty'),
	eps: v.union([valibotSchemas.validNumber, v.null()]),
	epsEstimated: v.union([valibotSchemas.validNumber, v.null()]),
	revenue: v.union([valibotSchemas.validNumber, v.null()]),
	revenueEstimated: v.union([valibotSchemas.validNumber, v.null()]),
	announceTime: v.union([v.literal('bmo'), v.literal('amc')]),
	fiscalDateEnding: v.date(),
	updatedFromDate: v.date()
});

export default IEarningsDTO;
