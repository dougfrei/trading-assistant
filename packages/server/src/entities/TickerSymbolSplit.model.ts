import { DbTickerSymbolSplit } from 'src/db/types/tables/tickerSymbolSplits';

export class TickerSymbolSplit {
	public id: number;
	public tickerSymbolId: number;
	public date: string;
	public from: number;
	public to: number;
	public candlesUpdated: boolean;

	constructor(params: Partial<TickerSymbolSplit> = {}) {
		this.id = params.id ?? 0;
		this.tickerSymbolId = params.tickerSymbolId ?? 0;
		this.date = params.date ?? '';
		this.from = params.from ?? 0;
		this.to = params.to ?? 0;
		this.candlesUpdated = params.candlesUpdated ?? false;
	}

	static fromDbRecord(data: DbTickerSymbolSplit): TickerSymbolSplit {
		return new TickerSymbolSplit({
			id: data.id,
			tickerSymbolId: data.ticker_symbol_id,
			date: data.date,
			from: data.from_value,
			to: data.to_value,
			candlesUpdated: data.candles_updated
		});
	}
}
