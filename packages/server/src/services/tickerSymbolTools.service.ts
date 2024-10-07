import { Injectable, Logger } from '@nestjs/common';
import { ECandlePeriodType, getYMDdateString } from '@trading-assistant/common';
import { subYears } from 'date-fns';
import { Database } from 'src/db/db.module';
import { TickerSymbol } from 'src/entities/TickerSymbol.model';
import { DbCandleService } from 'src/services/db/dbCandle.service';
import { DbTickerSymbolService } from 'src/services/db/dbTickerSymbol.service';
import { DbTickerSymbolSplitsService } from 'src/services/db/dbTickerSymbolSplits.service';
import { getAverageVolumeForCandles } from 'src/util/candle';

@Injectable()
export class TickerSymbolToolsService {
	private readonly logger = new Logger(TickerSymbolToolsService.name);

	constructor(
		private readonly dbCandleService: DbCandleService,
		private readonly dbTickerSymbolService: DbTickerSymbolService,
		private readonly dbTickerSymbolSplitsService: DbTickerSymbolSplitsService,
		private readonly db: Database
	) {}

	/**
	 * Update the ticker symbol meta (all-time high/low, TTM high/low), set the
	 * most recent price, and set the 20-day average volume
	 *
	 * @param ticker The ticker symbol to process
	 */
	async updateTickerSymbolMeta(ticker: string) {
		const tickerSymbolRecord = await this.dbTickerSymbolService.getTickerSymbolByName(
			ticker.toUpperCase()
		);

		if (!tickerSymbolRecord) {
			return;
		}

		const candles = await this.dbCandleService.getCandlesByTickerSymbolId(
			tickerSymbolRecord.id,
			{
				periodType: ECandlePeriodType.D,
				order: 'period_asc'
			}
		);

		if (!candles.length) {
			return;
		}

		const mostRecentCandle = candles.at(-1);

		if (!mostRecentCandle) {
			return;
		}

		const ttmDate = subYears(mostRecentCandle.period, 1);
		const ttmCandles = candles.filter((candle) => candle.period >= ttmDate);

		const ttmValues = ttmCandles.reduce(
			(acum, candle) => {
				if (candle.close < acum.low || acum.low === 0) {
					acum.low = candle.close;
				}

				if (candle.close > acum.high || acum.high === 0) {
					acum.high = candle.close;
				}

				return acum;
			},
			{ low: 0, high: 0 }
		);

		await this.dbTickerSymbolService.updateTickerSymbolById(tickerSymbolRecord.id, {
			last_price: mostRecentCandle.close,
			avg_daily_vol: getAverageVolumeForCandles(candles, 20),
			ttm_low: ttmValues.low,
			ttm_high: ttmValues.high,
			all_time_low:
				mostRecentCandle.low < tickerSymbolRecord.allTimeLow
					? mostRecentCandle.low
					: tickerSymbolRecord.allTimeLow,
			all_time_high:
				mostRecentCandle.high > tickerSymbolRecord.allTimeHigh
					? mostRecentCandle.high
					: tickerSymbolRecord.allTimeHigh
		});
	}

	/**
	 * Update candle records to reflect the value changes caused by a stock split
	 *
	 * @param tickerSymbol The ticker symbol entity object that requires split processing
	 * @param effectiveDate The effective date of the split
	 * @param from The numerator value of the split
	 * @param to The denominator value of the split
	 * @returns The number of updated candle rows
	 */
	async processSplit(
		tickerSymbol: TickerSymbol,
		effectiveDate: Date,
		from: number,
		to: number
	): Promise<number> {
		const effectiveDateYMD = getYMDdateString(effectiveDate);

		// look up existing split processing in the ticker_symbol_splits table
		const processedSplitRecords = await this.dbTickerSymbolSplitsService.getTickerSymbolSplits({
			tickerSymbolId: tickerSymbol.id,
			candlesUpdated: true
		});

		const foundProcessedSplitRecord = processedSplitRecords.find((record) => {
			return record.date === effectiveDateYMD;
		});

		if (foundProcessedSplitRecord) {
			this.logger.error(
				`stock split for ${tickerSymbol.name} [${from}/${to}] on ${effectiveDateYMD} has already been processed`
			);

			return 0;
		}

		const ratio = from / to;
		let totalNumUpdatedRows = 0;

		const countsPerPeriod = await this.db
			.selectFrom('candles')
			.where('ticker_symbol_id', '=', tickerSymbol.id)
			.groupBy('period_type')
			.select((builder) => builder.fn.count('id').as('num_candles'))
			.select('period_type')
			.execute();

		await this.db.transaction().execute(async (trx) => {
			for (const countPerPeriod of countsPerPeriod) {
				const periodCount = Number(countPerPeriod.num_candles);

				if (!periodCount) {
					continue;
				}

				this.logger.log(
					{
						splitFrom: from,
						splitTo: to,
						splitRatio: ratio,
						tickerSymbol: tickerSymbol.name,
						effectiveDate: effectiveDateYMD
					},
					`processing ${tickerSymbol.name} stock split (${countPerPeriod.period_type}) [${from} / ${to}] effective ${effectiveDateYMD}`
				);

				const periodUpdateRes = await trx
					.updateTable('candles')
					.set((eb) => ({
						open: eb('open', '*', ratio),
						high: eb('high', '*', ratio),
						low: eb('low', '*', ratio),
						close: eb('close', '*', ratio),
						volume: eb('volume', '*', ratio)
					}))
					.where('ticker_symbol_id', '=', tickerSymbol.id)
					.where('period', '<', effectiveDate)
					.where('period_type', '=', countPerPeriod.period_type)
					.executeTakeFirstOrThrow();

				totalNumUpdatedRows = Number(periodUpdateRes.numUpdatedRows);
			}

			await this.dbTickerSymbolService.updateTickerSymbolByName.call(
				{ db: trx },
				tickerSymbol.name,
				{
					ttm_high: tickerSymbol.ttmHigh * ratio,
					ttm_low: tickerSymbol.ttmLow * ratio,
					all_time_high: tickerSymbol.allTimeHigh * ratio,
					all_time_low: tickerSymbol.allTimeLow * ratio
				}
			);

			await this.dbTickerSymbolSplitsService.upsertTickerSymbolSplit.call(
				{ db: trx },
				{
					ticker_symbol_id: tickerSymbol.id,
					date: effectiveDateYMD,
					from_value: from,
					to_value: to,
					candles_updated: true
				}
			);

			return totalNumUpdatedRows;
		});

		return totalNumUpdatedRows;
	}
}
