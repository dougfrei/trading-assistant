import { Injectable } from '@nestjs/common';
import { ECandlePeriodType } from '@trading-assistant/common';
import { endOfDay, startOfDay } from 'date-fns';
import { Database } from 'src/db/db.module';
import { DbCandleNew, DbCandleUpdate } from 'src/db/types/tables/candles';
import { Candle } from 'src/entities/Candle.model';
import { DbCandleService } from 'src/services/db/dbCandle.service';
import { DbTickerSymbolService } from 'src/services/db/dbTickerSymbol.service';
import { getDerivativeDateObjects } from 'src/util/candle';
import { DEFAULT_MARKET_TICKER_SYMBOL } from 'src/util/constants';

@Injectable()
export class CandlesService {
	constructor(
		private readonly db: Database,
		private readonly dbCandleService: DbCandleService,
		private readonly dbTickerSymbolService: DbTickerSymbolService
	) {}

	/**
	 * Create derivative candles for a ticker symbol using the specified period type.
	 * Existing candles will be removed.
	 *
	 * @param tickerSymbolId ID of the ticker symbol record to process
	 * @param derivativeCandlePeriodType The type of derivative period to create
	 * @param sourcePeriodType The source period type to use in calculating the derivative candles (default is D ("daily"))
	 * @returns The number of derivative period candles created
	 */
	async createDerivativeCandles(
		tickerSymbolId: number,
		derivativeCandlePeriodType: ECandlePeriodType,
		sourcePeriodType: ECandlePeriodType = ECandlePeriodType.D
	): Promise<number> {
		await this.dbCandleService.deleteCandles({
			tickerSymbolId,
			periodType: derivativeCandlePeriodType
		});

		const sourceCandles = await this.dbCandleService.getCandlesByTickerSymbolId(
			tickerSymbolId,
			{
				periodType: sourcePeriodType,
				order: 'period_asc'
			}
		);

		const dvGroupsMap: Map<number, Candle[]> = sourceCandles.reduce((acum, candle) => {
			const derivativeDateStartTs = getDerivativeDateObjects(
				derivativeCandlePeriodType,
				candle.period
			).start.getTime();

			acum.set(derivativeDateStartTs, [...(acum.get(derivativeDateStartTs) ?? []), candle]);

			return acum;
		}, new Map());

		const dvCandles = Array.from(dvGroupsMap).map<DbCandleNew>(
			([dvPeriodTimestamp, candles]) => {
				candles.sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());

				const firstCandle = candles[0];
				const lastCandle = candles[candles.length - 1];
				const volume = candles.reduce((acum, candle) => acum + candle.volume, 0);

				return {
					ticker_symbol_id: tickerSymbolId,
					open: firstCandle.open,
					high: candles.reduce((acum, candle) => {
						if (candle.high > acum) {
							acum = candle.high;
						}
						return acum;
					}, firstCandle.high),
					low: candles.reduce((acum, candle) => {
						if (candle.low < acum) {
							acum = candle.low;
						}
						return acum;
					}, firstCandle.low),
					close: lastCandle.close,
					volume,
					period: new Date(dvPeriodTimestamp),
					period_type: derivativeCandlePeriodType
				};
			}
		);

		let numCreated = 0;

		if (dvCandles.length) {
			numCreated = await this.dbCandleService.createCandles(dvCandles);
		}

		return numCreated;
	}

	/**
	 * Update derivative candles for a the specified period type beginning with
	 * the provided start date. New derivative candles will be created if they
	 * don't exist.
	 *
	 * @param tickerSymbolIds An array of ticker symbol record IDs
	 * @param derivativePeriodType The derivative period type used to create or update candles
	 * @param startDate A date object representing when derivative period creation begins
	 * @param sourcePeriodType The source period type to use in calculating the derivative candles (default is D ("daily"))
	 * @returns Object with "insertCount" and "updateCount" properties
	 */
	async updateDerivativeCandles(
		tickerSymbolIds: number[],
		derivativePeriodType: ECandlePeriodType,
		startDate: Date,
		sourcePeriodType: ECandlePeriodType = ECandlePeriodType.D
	) {
		const dvDates = getDerivativeDateObjects(derivativePeriodType, startDate);

		const sourceCandles = await this.dbCandleService.getCandlesFlexibleQuery((query) =>
			query
				.where('ticker_symbol_id', 'in', tickerSymbolIds)
				.where('period_type', '=', sourcePeriodType)
				.where('period', '>=', startOfDay(dvDates.start))
				.where('period', '<=', endOfDay(dvDates.end))
				.orderBy('period asc')
		);

		const newValuesMap = sourceCandles.reduce((acum, candle) => {
			const record = acum.get(candle.tickerSymbolId) ?? {
				o: 0,
				h: 0,
				l: 0,
				c: 0,
				v: 0
			};

			if (record.o === 0) {
				record.o = candle.open;
			}

			if (candle.high > record.h || record.h === 0) {
				record.h = candle.high;
			}

			if (candle.low < record.l || record.l === 0) {
				record.l = candle.low;
			}

			record.c = candle.close;
			record.v = record.v + candle.volume;

			acum.set(candle.tickerSymbolId, record);

			return acum;
		}, new Map<number, { o: number; h: number; l: number; c: number; v: number }>());

		const existingDvCandles = await this.dbCandleService.getCandlesFlexibleQuery((query) =>
			query
				.where('ticker_symbol_id', 'in', tickerSymbolIds)
				.where('period_type', '=', derivativePeriodType)
				.where('period', '>=', startOfDay(dvDates.start))
				.where('period', '<=', endOfDay(dvDates.end))
		);

		const existingDvCandlesMap = new Map(
			existingDvCandles.map((candle) => [candle.tickerSymbolId, candle])
		);

		const newDbRecords: DbCandleNew[] = [];
		const updateDbRecords: DbCandleUpdate[] = [];

		tickerSymbolIds.forEach((tickerSymbolId) => {
			const newValues = newValuesMap.get(tickerSymbolId);

			if (!newValues) {
				return;
			}

			const existingRecord = existingDvCandlesMap.get(tickerSymbolId);

			if (existingRecord) {
				updateDbRecords.push({
					...existingRecord.toDbInsertRecord(),
					id: existingRecord.id,
					open: newValues.o,
					high: newValues.h,
					low: newValues.l,
					close: newValues.c,
					volume: newValues.v
				});
			} else {
				newDbRecords.push({
					ticker_symbol_id: tickerSymbolId,
					open: newValues.o,
					high: newValues.h,
					low: newValues.l,
					close: newValues.c,
					volume: newValues.v,
					period: dvDates.start,
					period_type: derivativePeriodType
				});
			}
		});

		let insertCount = 0;
		let updateCount = 0;

		if (newDbRecords.length) {
			insertCount = await this.dbCandleService.createCandles(newDbRecords);
		}

		if (updateDbRecords.length) {
			updateCount = await this.dbCandleService.updateManyCandlesOHLCV(updateDbRecords);
		}

		return { insertCount, updateCount };
	}

	/**
	 * Return the most recent candle object
	 *
	 * @param periodType The candle period type
	 * @param tickerSymbol An optional ticker symbol name to use
	 * @returns The most recent candle object for the specified period type
	 */
	async getMostRecentMarketCandle(
		periodType: ECandlePeriodType,
		tickerSymbol: string = DEFAULT_MARKET_TICKER_SYMBOL
	): Promise<Candle> {
		const tickerSymbolRecord = await this.dbTickerSymbolService.getTickerSymbolByName(
			tickerSymbol.toUpperCase()
		);

		if (!tickerSymbolRecord) {
			throw new Error(`Cannot find ticker symbol record for ${tickerSymbolRecord}`);
		}

		const candles = await this.dbCandleService.getCandlesByTickerSymbolId(
			tickerSymbolRecord.id,
			{
				periodType,
				order: 'period_desc',
				limit: 1
			}
		);

		if (!Array.isArray(candles) || !candles.length) {
			throw new Error(`No candles exist for ticker symbol ${tickerSymbolRecord}`);
		}

		return candles[0];
	}
}
