import { Injectable } from '@nestjs/common';
import { ECandlePeriodType } from '@trading-assistant/common';
import { sql } from 'kysely';
import BaseAnalyzer from 'src/analysis/BaseAnalyzer';
import { RVolAnalyzer } from 'src/analysis/analyzers/RVolAnalyzer';
import calculateVwapOhlc4 from 'src/analysis/indicators/vwapOHLC4';
import { AppConfigService } from 'src/app-config/appConfig.service';
import { Database } from 'src/db/db.module';
import { Candle } from 'src/entities/Candle.model';
import { TickerSymbol } from 'src/entities/TickerSymbol.model';
import { DbCandleService, IGetCandlesArgs } from 'src/services/db/dbCandle.service';
import { DbTickerSymbolService } from 'src/services/db/dbTickerSymbol.service';
import TCandleAnalysisEmitter from 'src/types/emitters/candle-analysis-emitter';
import { analyzeCandles } from 'src/util/analyze';
import { DEFAULT_MARKET_TICKER_SYMBOL } from 'src/util/constants';
import { getErrorObject } from 'src/util/errors';
import { getSectorETFTickerSymbolNameByGCIS } from 'src/util/etfs';
import { twoDecimals } from 'src/util/math';
import TypedEventEmitter from 'src/util/typed-event-emitter';

interface IAVWAPGroup {
	anchorPeriod: Date;
	vwapValues: {
		period: Date;
		value: number;
	}[];
	overUnderRatio: number;
}

@Injectable()
export class CandleAnalysisService {
	public progressEmitter = new TypedEventEmitter<TCandleAnalysisEmitter>();

	constructor(
		private readonly dbCandleService: DbCandleService,
		private readonly dbTickerSymbolService: DbTickerSymbolService,
		private readonly db: Database,
		private readonly appConfig: AppConfigService
	) {}

	/**
	 * Run the provided analyzers on the specified TickerSymbol object
	 *
	 * @param tickerSymbolRecord TickerSymbol object to process
	 * @param analyzerSet An array of objects that extend BaseAnalyzer
	 * @param param Analysis parameters object
	 */
	protected async analyzeCandlesForTickerSymbolRecord(
		tickerSymbolRecord: TickerSymbol,
		analyzerSet: BaseAnalyzer[],
		{
			periodType = ECandlePeriodType.D,
			deltaUpdate = false,
			resetIndicatorsAndAlerts = false
		}: {
			periodType?: ECandlePeriodType;
			deltaUpdate?: boolean;
			resetIndicatorsAndAlerts?: boolean;
		} = {}
	) {
		if (!tickerSymbolRecord) {
			return;
		}

		performance.mark('analyze-start');

		// NOTE: Normally, this would be 'period_asc', but in the event of a delta
		// update where we limit the number of candles returned we want to ensure
		// that we're returning the most recent candles. The order is corrected
		// below in the 'getCandlesByTickerSymbolId' call where the returned order
		// is reversed.
		const getCandlesParams: IGetCandlesArgs = {
			periodType,
			order: 'period_desc'
		};

		if (deltaUpdate) {
			const numDeltaCandles = Math.max(
				...analyzerSet.map((analyzer) => analyzer.getMinimumRequiredCandles())
			);

			getCandlesParams.limit = numDeltaCandles;
		}

		let sourceCandles = (
			await this.dbCandleService.getCandlesByTickerSymbolId(
				tickerSymbolRecord.id,
				getCandlesParams
			)
		).reverse();

		if (!sourceCandles.length) {
			throw new Error('no candles for this ticker and period');
		}

		if (resetIndicatorsAndAlerts) {
			if (deltaUpdate) {
				throw new Error(
					'resetting indicators and alerts is not possible when performing a delta update'
				);
			} else {
				sourceCandles = sourceCandles.map((candle) => {
					candle.indicators = new Map();
					candle.alerts = new Set();

					return candle;
				});
			}
		}

		const [analyzeErrors, analyzedCandles] = analyzeCandles(sourceCandles, analyzerSet);

		if (analyzeErrors.length) {
			this.progressEmitter.emit('analysis:error', {
				message: analyzeErrors.join(', '),
				tickerSymbol: tickerSymbolRecord.name,
				periodType
			});
		}

		performance.mark('analyze-end');

		// gather the candle records needed to create the update value clauses
		const candlesForValueClauses = deltaUpdate ? [] : analyzedCandles;

		if (deltaUpdate) {
			const lastCandle = analyzedCandles.at(-1);

			if (lastCandle) {
				candlesForValueClauses.push(lastCandle);
			}
		}

		const valueClauses = candlesForValueClauses.map(
			(candle) =>
				`(${candle.id}, '${JSON.stringify(Object.fromEntries(candle.indicators))}'::json, '${JSON.stringify(Array.from(candle.alerts))}'::json)`
		);

		// update the candle records
		if (valueClauses.length) {
			// NOTE: An alternate way of doing this batch update is with the "onConflict" clause.
			// If the method below isn't performing well on large updates, this method could be tested.
			//
			// const upsertRes = await this.db
			// 	.insertInto('candles')
			// 	.values([{ id: 1, indicators: '[]' }])
			// 	.onConflict((oc) =>
			// 		oc
			// 			.column('id')
			// 			.doUpdateSet({ indicators: sql`excluded.indicators` })
			// 	)
			// 	.executeTakeFirst();

			const updateRes = await this.db
				.updateTable('candles')
				.from(
					// @ts-expect-error Kysely doesn't seem to have a way to do this without a typing error
					sql`(VALUES ${sql.raw(valueClauses.join(','))}) AS c(ref_id, new_indicators, new_alerts)`
				)
				.set({
					// @ts-expect-error Kysely doesn't seem to have a way to do this without a typing error
					indicators: sql`c.new_indicators`,
					alerts: sql`c.new_alerts`
				})
				// @ts-expect-error Kysely doesn't seem to have a way to do this without a typing error
				.where('candles.id', '=', sql`c.ref_id`)
				.executeTakeFirst();

			this.progressEmitter.emit('analysis:debug', {
				tickerSymbolName: tickerSymbolRecord.name,
				periodType,
				message: `DB updated with ${updateRes.numUpdatedRows} rows modified`
			});
		}

		performance.mark('db-update-end');

		this.progressEmitter.emit('analysis:benchmarks', {
			tickerSymbolName: tickerSymbolRecord.name,
			periodType,
			analyze: performance.measure('analyze-duration', 'analyze-start', 'analyze-end')
				.duration,
			dbUpdate: performance.measure('db-update-duration', 'analyze-end', 'db-update-end')
				.duration,
			total: performance.measure('total', 'analyze-start', 'db-update-end').duration
		});
	}

	/**
	 * Run the configured analyzers on the specified ticker symbols. If the ticker
	 * symbols array is empty, all available ticker symbols will be processed.
	 *
	 * @param tickerSymbols An array of ticker symbol names. All available ticker symbols will be used if this array is empty.
	 * @param params Analysis parameters object
	 */
	async analyzeCandlesForTickerSymbols(
		tickerSymbols: string[],
		{
			periodTypes = [ECandlePeriodType.D, ECandlePeriodType.W],
			resetIndicatorsAndAlerts = false,
			deltaUpdate = false
		}: {
			periodTypes?: ECandlePeriodType[];
			resetIndicatorsAndAlerts?: boolean;
			deltaUpdate?: boolean;
		} = {}
	) {
		const refCandlesMap = new Map<string, Candle[]>();

		const tickerSymbolRecords = tickerSymbols.length
			? await this.dbTickerSymbolService.getTickerSymbols({
					names: tickerSymbols,
					active: true
				})
			: await this.dbTickerSymbolService.getTickerSymbols({
					active: true,
					order: 'name asc'
				});

		this.progressEmitter.emit('analysis:start', { totalCount: tickerSymbolRecords.length });

		for (let i = 0; i < tickerSymbolRecords.length; i++) {
			this.progressEmitter.emit('analysis:process-ticker-symbol', {
				tickerSymbol: tickerSymbolRecords[i].name,
				currentIndex: i + 1,
				totalCount: tickerSymbolRecords.length
			});

			const sectorETFTickerSymbol = getSectorETFTickerSymbolNameByGCIS(
				tickerSymbolRecords[i].gcis
			);

			for (const periodType of periodTypes) {
				const marketRefPeriodKey = DEFAULT_MARKET_TICKER_SYMBOL
					? `${DEFAULT_MARKET_TICKER_SYMBOL}:${periodType}`
					: '';
				const sectorRefPeriodKey = sectorETFTickerSymbol
					? `${sectorETFTickerSymbol}:${periodType}`
					: '';

				if (marketRefPeriodKey && !refCandlesMap.has(marketRefPeriodKey)) {
					// get market ref candles
					const marketRefPeriodCandles =
						await this.dbCandleService.getCandlesByTickerSymbolName(
							DEFAULT_MARKET_TICKER_SYMBOL,
							{
								periodType,
								order: 'period_asc'
							}
						);

					refCandlesMap.set(marketRefPeriodKey, marketRefPeriodCandles);
				}

				if (sectorRefPeriodKey && !refCandlesMap.has(sectorRefPeriodKey)) {
					// get sector ref candles
					const sectorRefPeriodCandles =
						await this.dbCandleService.getCandlesByTickerSymbolName(
							sectorETFTickerSymbol,
							{
								periodType,
								order: 'period_asc'
							}
						);

					refCandlesMap.set(sectorRefPeriodKey, sectorRefPeriodCandles);
				}

				const analyzerSet = await this.appConfig.getAnalyzerConfigForPeriodType(
					periodType,
					{
						referenceCandles: {
							market:
								tickerSymbolRecords[i].name === DEFAULT_MARKET_TICKER_SYMBOL
									? []
									: (refCandlesMap.get(marketRefPeriodKey) ?? []),
							sector:
								tickerSymbolRecords[i].name === sectorETFTickerSymbol
									? []
									: (refCandlesMap.get(sectorRefPeriodKey) ?? [])
						}
					}
				);

				try {
					await this.analyzeCandlesForTickerSymbolRecord(
						tickerSymbolRecords[i],
						analyzerSet,
						{
							periodType,
							resetIndicatorsAndAlerts,
							deltaUpdate: deltaUpdate
						}
					);
				} catch (err: unknown) {
					this.progressEmitter.emit('analysis:error', {
						message: getErrorObject(err).message,
						tickerSymbol: tickerSymbolRecords[i].name,
						periodType
					});
				}
			}
		}

		this.progressEmitter.emit('analysis:end', { totalCount: tickerSymbolRecords.length });
	}

	/**
	 * Generate AVWAP group objects for the specified ticker symbol
	 *
	 * NOTE: This functionality is currently unused and should likely become an
	 * analyzer once a reliable data source for earnings dates (ideal days to
	 * start an AVWAP group) is found.
	 *
	 * @param ticker The ticker symbol name to generate AVWAP groups for
	 * @param opts AVWAP group generation options
	 * @returns Array of IAVWAPGroup objects
	 */
	async getAVWAPgroupsForTicker(
		ticker: string,
		opts: {
			periodType?: ECandlePeriodType;
			rvolThreshold?: number;
			rvolPeriod?: number;
		} = {}
	) {
		const { periodType = ECandlePeriodType.D, rvolThreshold = 1.1, rvolPeriod = 20 } = opts;

		const tickerRecord = await this.dbTickerSymbolService.getTickerSymbolByName(ticker);
		const candles = tickerRecord
			? await this.dbCandleService.getCandlesByTickerSymbolId(tickerRecord.id, {
					periodType,
					order: 'period_asc'
				})
			: [];

		if (!candles.length) {
			return [];
		}

		const [, analyzedCandles] = analyzeCandles(candles, [
			new RVolAnalyzer({ period: rvolPeriod })
		]);

		const avwapGroups = analyzedCandles.reduce<IAVWAPGroup[]>(
			(acum, candle, curIndex, srcArray) => {
				const rvol = candle.indicators.get(RVolAnalyzer.INDICATOR_KEY_RVOL);

				if (typeof rvol !== 'number' || rvol < rvolThreshold) {
					return acum;
				}

				const startIndex = srcArray.findIndex(
					(srcCandle) => srcCandle.period === candle.period
				);

				if (startIndex === -1) {
					return acum;
				}

				const vwapCandles = srcArray.slice(startIndex);
				const vwapValues = calculateVwapOhlc4({
					open: vwapCandles.map((vwapCandle) => vwapCandle.open),
					high: vwapCandles.map((vwapCandle) => vwapCandle.high),
					low: vwapCandles.map((vwapCandle) => vwapCandle.low),
					close: vwapCandles.map((vwapCandle) => vwapCandle.close),
					volume: vwapCandles.map((vwapCandle) => vwapCandle.volume)
				});

				const overUnderCounts = vwapValues.reduce(
					(acum, vwapValue, index) => {
						const candle = vwapCandles[index] ?? null;

						if (!candle) {
							return acum;
						}

						if (candle.close >= vwapValue) {
							acum.above += 1;
						} else {
							acum.below += 1;
						}

						return acum;
					},
					{ above: 0, below: 0 }
				);

				let overUnderRatio =
					overUnderCounts.above / (overUnderCounts.above + overUnderCounts.below);

				if (overUnderCounts.above === 0 && overUnderCounts.below === 0) {
					overUnderRatio = 0.5;
				} else if (overUnderCounts.above === 0) {
					overUnderRatio = 0;
				} else if (overUnderCounts.below === 0) {
					overUnderRatio = 1;
				}

				acum.push({
					anchorPeriod: candle.period,
					vwapValues: vwapValues.map((vwapValue, index) => ({
						period: vwapCandles[index].period,
						value: twoDecimals(vwapValue)
					})),
					// overUnderCounts,
					overUnderRatio: twoDecimals(overUnderRatio)
				});

				return acum;
			},
			[]
		);

		return avwapGroups[avwapGroups.length - 4];
		// return avwapGroups;
	}
}
