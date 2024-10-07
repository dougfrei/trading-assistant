import { isValidYMDdateString } from '@trading-assistant/common';
import * as v from 'valibot';

interface IMarketHolidayDTO {
	dateYMD: string;
	isEarlyClose: boolean;
}

export const validMarketHolidayDTO = v.object({
	dateYMD: v.pipe(
		v.string(),
		v.check((value) => isValidYMDdateString(value), 'invalid YYYY-MM-DD format')
	),
	isEarlyClose: v.boolean()
});

export default IMarketHolidayDTO;
