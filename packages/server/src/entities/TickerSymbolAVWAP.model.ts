import { EAVWAPType } from '@trading-assistant/common';
import { DbTickerSymbolAVWAP } from 'src/db/types/tables/tickerSymbolAVWAP';

export class TickerSymbolAVWAP {
	public id: number;
	public tickerSymbolId: number;
	public startCandleId: number;
	public type: EAVWAPType;

	constructor(params: Partial<TickerSymbolAVWAP> = {}) {
		this.id = params.id ?? 0;
		this.tickerSymbolId = params.tickerSymbolId ?? 0;
		this.startCandleId = params.startCandleId ?? 0;
		this.type = params.type ?? EAVWAPType.OTHER;
	}

	static fromDbRecord(data: DbTickerSymbolAVWAP): TickerSymbolAVWAP {
		return new TickerSymbolAVWAP({
			id: data.id,
			tickerSymbolId: data.ticker_symbol_id,
			startCandleId: data.start_candle_id,
			type: data.type
		});
	}
}
