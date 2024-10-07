import { ETickerSymbolType } from '@trading-assistant/common';
import { DbTickerSymbol } from 'src/db/types/tables/tickerSymbols';

export class TickerSymbol {
	public id: number;
	public name: string;
	public label: string;
	public avgDailyVol: number;
	public marketCap: bigint;
	public lastPrice: number;
	public allTimeHigh: number;
	public allTimeLow: number;
	public ttmHigh: number;
	public ttmLow: number;
	public active: boolean;
	public gcis: string;
	public type: ETickerSymbolType;
	public truncatedValues: Map<string, number>;

	constructor(params: Partial<TickerSymbol> = {}) {
		this.id = params.id ?? 0;
		this.name = params.name ?? '';
		this.label = params.label ?? '';
		this.avgDailyVol = params.avgDailyVol ?? 0;
		this.marketCap = params.marketCap ?? BigInt(0);
		this.lastPrice = params.lastPrice ?? 0;
		this.allTimeHigh = params.allTimeHigh ?? 0;
		this.allTimeLow = params.allTimeLow ?? 0;
		this.ttmHigh = params.ttmHigh ?? 0;
		this.ttmLow = params.ttmLow ?? 0;
		this.active = params.active ?? false;
		this.gcis = params.gcis ?? '';
		this.type = params.type ?? ETickerSymbolType.stock;
		this.truncatedValues = params.truncatedValues ?? new Map();
	}

	static fromDbRecord(data: DbTickerSymbol): TickerSymbol {
		return new TickerSymbol({
			id: data.id,
			name: data.name,
			label: data.label ?? '',
			avgDailyVol: data.avg_daily_vol,
			marketCap: data.market_cap,
			lastPrice: data.last_price,
			allTimeHigh: data.all_time_high,
			allTimeLow: data.all_time_low,
			ttmHigh: data.ttm_high,
			ttmLow: data.ttm_low,
			active: data.active,
			gcis: data.gcis,
			type: data.type,
			truncatedValues: new Map(Object.entries(data.truncated_values))
		});
	}
}
