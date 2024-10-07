import { DbTickerSymbolEarnings } from 'src/db/types/tables/tickerSymbolEarnings';

export class TickerSymbolEarnings {
	public id: number;
	public tickerSymbolId: number;
	public date: string;
	public afterClose: boolean;
	public eps: number | null;
	public epsEstimated: number | null;
	public revenue: bigint | null;
	public revenueEstimated: bigint | null;
	public fiscalDateEnding: string;

	constructor(params: Partial<TickerSymbolEarnings> = {}) {
		this.id = params.id ?? 0;
		this.tickerSymbolId = params.tickerSymbolId ?? 0;
		this.date = params.date ?? '';
		this.afterClose = params.afterClose ?? false;
		this.eps = params.eps ?? 0;
		this.epsEstimated = params.epsEstimated ?? 0;
		this.revenue = params.revenue ?? BigInt(0);
		this.revenueEstimated = params.revenueEstimated ?? BigInt(0);
		this.fiscalDateEnding = params.fiscalDateEnding ?? '';
	}

	static fromDbRecord(data: DbTickerSymbolEarnings): TickerSymbolEarnings {
		return new TickerSymbolEarnings({
			id: data.id,
			tickerSymbolId: data.ticker_symbol_id,
			date: data.date,
			afterClose: data.after_close,
			eps: data.eps,
			epsEstimated: data.esp_estimated,
			revenue: data.revenue,
			revenueEstimated: data.revenue_estimated,
			fiscalDateEnding: data.fiscal_date_ending ?? ''
		});
	}
}
