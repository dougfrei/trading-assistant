import { DbNYSEMarketHolidays } from 'src/db/types/tables/nyseMarketHolidays';

export class NYSEMarketHoliday {
	public id: number;
	public date: string;
	public isEarlyClose: boolean;

	constructor(params: Partial<NYSEMarketHoliday> = {}) {
		this.id = params.id ?? 0;
		this.date = params.date ?? '';
		this.isEarlyClose = params.isEarlyClose ?? false;
	}

	static fromDbRecord(data: DbNYSEMarketHolidays): NYSEMarketHoliday {
		return new NYSEMarketHoliday({
			id: data.id,
			date: data.date,
			isEarlyClose: data.is_early_close
		});
	}
}
