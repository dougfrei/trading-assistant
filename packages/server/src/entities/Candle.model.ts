import { ECandlePeriodType } from '@trading-assistant/common';
import { DbCandle, DbCandleNew } from 'src/db/types/tables/candles';
import { mapToJSONstring } from 'src/util/json';

export class Candle {
	public id: number;
	public tickerSymbolId: number;
	public open: number;
	public high: number;
	public low: number;
	public close: number;
	public volume: number;
	public period: Date;
	public periodType: ECandlePeriodType;
	public indicators: Map<string, number | null>;
	public alerts: Set<string>;
	public truncatedValues: Map<string, number>;

	constructor(params: Partial<Candle> = {}) {
		this.id = params.id ?? 0;
		this.tickerSymbolId = params.tickerSymbolId ?? 0;
		this.open = params.open ?? 0;
		this.high = params.high ?? 0;
		this.low = params.low ?? 0;
		this.close = params.close ?? 0;
		this.volume = params.volume ?? 0;
		this.period = params.period ?? new Date();
		this.periodType = params.periodType ?? ECandlePeriodType.D;
		this.indicators = params.indicators ?? new Map();
		this.alerts = params.alerts ?? new Set();
		this.truncatedValues = params.truncatedValues ?? new Map();
	}

	static fromDbRecord(data: DbCandle): Candle {
		return new Candle({
			id: data.id,
			tickerSymbolId: data.ticker_symbol_id,
			open: data.open,
			high: data.high,
			low: data.low,
			close: data.close,
			volume: data.volume,
			period: data.period,
			periodType: data.period_type,
			indicators: new Map(Object.entries(data.indicators)),
			alerts: new Set(data.alerts),
			truncatedValues: new Map(Object.entries(data.truncated_values))
		});
	}

	public toDbInsertRecord(): DbCandleNew {
		return {
			ticker_symbol_id: this.tickerSymbolId,
			open: this.open,
			high: this.high,
			low: this.low,
			close: this.close,
			volume: this.volume,
			period: this.period,
			period_type: this.periodType,
			indicators: mapToJSONstring(this.indicators),
			alerts: JSON.stringify(Array.from(this.alerts)),
			truncated_values: mapToJSONstring(this.truncatedValues)
		};
	}
}
