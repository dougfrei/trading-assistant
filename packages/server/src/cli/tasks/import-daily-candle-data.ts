import {
	ECandlePeriodType,
	getYMDdateString,
	isValidYMDdateString
} from '@trading-assistant/common';
import { Command } from 'commander';
import { endOfDay, isWeekend, startOfDay } from 'date-fns';
import CLITask from 'src/cli/cli-task';
import PolygonClientService from 'src/data-sources/PolygonClient.service';
import { DataSourcesModule } from 'src/data-sources/dataSources.module';
import { DbCandleNew } from 'src/db/types/tables/candles';
import { TickerSymbol } from 'src/entities/TickerSymbol.model';
import ICandleDTO from 'src/interfaces/ICandleDTO';
import { CandleUtilitiesModule } from 'src/services/candle-utilities/candleUtilities.module';
import { CandlesService } from 'src/services/candle-utilities/candles.service';
import { DbCandleService } from 'src/services/db/dbCandle.service';
import { DbNYSEMarketHolidaysService } from 'src/services/db/dbNYSEMarketHolidays';
import { DbTickerSymbolService } from 'src/services/db/dbTickerSymbol.service';
import { GeneralUtilitiesModule } from 'src/services/general-utilities/generalUtilities.module';
import { NYSEMarketDaysMathService } from 'src/services/general-utilities/nyseMarketDaysMath.service';
// import { TickerSymbolUtilitiesModule } from 'src/services/ticker-symbol-utilities/tickerSymbolUtilities.module';
// import { TickerSymbolToolsService } from 'src/services/tickerSymbolTools.service';
import { arrayUnique } from 'src/util/arrays';
import { getNYMarketOpenDateObject } from 'src/util/date';
import { getErrorObject } from 'src/util/errors';
import * as v from 'valibot';

class ImportDailyCandleDataTask extends CLITask {
	protected opts = {
		date: '',
		useStooqFile: ''
	};
	protected updateDerivativePeriods = [ECandlePeriodType.W];

	protected createCommanderTask(program: Command): void {
		program
			.command('import-daily-candle-data')
			.description('Import daily candle data from Polygon.io or Stooq')
			.option('-d, --date <date>', 'The date to retrieve data for in YYYY-MM-DD format', '')
			.option(
				'--use-stooq-file <stooq-file>',
				'Use data from Stooq instead of the Polygon.io API',
				''
			)
			.action(async (opts) => {
				this.opts = v.parse(
					v.object({
						date: v.pipe(
							v.string(),
							v.check(
								(value) =>
									value.trim().length > 0 ? isValidYMDdateString(value) : true,
								'Date must be in YYYY-MM-DD format'
							)
						),
						useStooqFile: v.optional(v.pipe(v.unknown(), v.string()), '')
					}),
					opts
				);

				if (!this.opts.date) {
					const marketDate = await this.getFirstMissingMarketDate();

					this.opts.date = getYMDdateString(marketDate);
				}

				if (getNYMarketOpenDateObject(this.opts.date).getTime() > new Date().getTime()) {
					throw new Error(
						`Selected date ${this.opts.date} is in the future and no import can be done at this time`
					);
				}

				console.log(`importing daily data for ${this.opts.date}`);

				await this.importDailyRecords();
			});
	}

	protected async getFirstMissingMarketDate() {
		const candlesService = this.app.select(CandleUtilitiesModule).get(CandlesService);
		const nyseMarketDaysMathService = this.app
			.select(GeneralUtilitiesModule)
			.get(NYSEMarketDaysMathService);

		let marketDate = new Date();

		try {
			const latestMarketCandle = await candlesService.getMostRecentMarketCandle(
				ECandlePeriodType.D
			);

			const nextMarketDay = await nyseMarketDaysMathService.addTradingDays(
				latestMarketCandle.period,
				1
			);

			marketDate = nextMarketDay;
		} catch (err: unknown) {
			const errObj = getErrorObject(err);

			console.log(`Failed to calculate first needed market date: ${errObj.message}`);
		}

		return marketDate;
	}

	protected async importDailyRecords() {
		const dbNYSEMarketHolidaysService = this.app.get(DbNYSEMarketHolidaysService);
		const dbCandleService = this.app.get(DbCandleService);
		const dbTickerSymbolService = this.app.get(DbTickerSymbolService);
		const candlesService = this.app.select(CandleUtilitiesModule).get(CandlesService);
		const polygonClientService = this.app.select(DataSourcesModule).get(PolygonClientService);
		// const tickerSymbolToolsService = this.app
		// 	.select(TickerSymbolUtilitiesModule)
		// 	.get(TickerSymbolToolsService);

		const dateObj = getNYMarketOpenDateObject(this.opts.date);

		// Check if the market was open on the requested day
		if (isWeekend(dateObj)) {
			throw new Error(`Market is not open on weekend date ${dateObj.toDateString()}`);
		}

		const marketHolidayRecord = await dbNYSEMarketHolidaysService.getSingle(dateObj);

		if (marketHolidayRecord && !marketHolidayRecord.isEarlyClose) {
			throw new Error(
				`Market was not open on the date ${dateObj.toDateString()} due to a holiday`
			);
		}

		// TODO: get the list of tradable symbols from FMP and set any current DB ticker symbols to inactive if necessary
		// const fmpTickerSymbols = new FMPTickerSymbolManager(
		// 	this.fmpClientService,
		// 	this.fmpCloudClientService
		// );

		// await fmpTickerSymbols.init();

		const notices: string[] = [];

		const tickerSymbols = await dbTickerSymbolService.getTickerSymbols({ order: 'name asc' });

		// get new EOD records
		let eodRecords: ICandleDTO[] = [];

		if (this.opts.useStooqFile) {
			// TODO: use logic from stooq daily file handler
		} else {
			eodRecords = await polygonClientService.getDailyCandles(dateObj);
		}

		// check for active ticker symbols with no trades for the current day
		const activeTickerSymbolsWithNoTrades = tickerSymbols.reduce<TickerSymbol[]>(
			(acum, tickerSymbol) => {
				const foundRecord = eodRecords.find(
					(record) => record.tickerSymbol === tickerSymbol.name
				);

				if (!foundRecord && tickerSymbol.active) {
					acum.push(tickerSymbol);
				}

				return acum;
			},
			[]
		);

		if (activeTickerSymbolsWithNoTrades.length) {
			// set the ticker symbol(s) as inactive
			const tickerSymbolIds = activeTickerSymbolsWithNoTrades.map(
				(tickerSymbol) => tickerSymbol.id
			);

			await dbTickerSymbolService.updateTickerSymbolById(tickerSymbolIds, {
				active: false
			});

			const namesStr = activeTickerSymbolsWithNoTrades
				.map((tickerSymbol) => tickerSymbol.name)
				.join(', ');

			notices.push(
				`the following ticker symbol(s) were made inactive since they had no trades on ${getYMDdateString(dateObj)}: ${namesStr}`
			);
		}

		// create daily candles insert objects
		const candlesTickerSymbolMap = new Map<string, DbCandleNew>();

		eodRecords.forEach((eodRecord) => {
			const recordSymbolUC = eodRecord.tickerSymbol.toUpperCase();
			const matchingActiveTickerSymbol = tickerSymbols.find(
				(ticker) => ticker.name.toUpperCase() === recordSymbolUC && ticker.active
			);

			if (!matchingActiveTickerSymbol) {
				return;
			}

			if (candlesTickerSymbolMap.has(matchingActiveTickerSymbol.name)) {
				notices.push(
					`duplicate record for ticker symbol: ${matchingActiveTickerSymbol.name}`
				);
			}

			candlesTickerSymbolMap.set(matchingActiveTickerSymbol.name, {
				ticker_symbol_id: matchingActiveTickerSymbol.id,
				period: dateObj,
				period_type: ECandlePeriodType.D,
				open: eodRecord.open,
				high: eodRecord.high,
				low: eodRecord.low,
				close: eodRecord.close,
				volume: eodRecord.volume
			});
		});

		const candles = Array.from(candlesTickerSymbolMap.values());

		// remove existing candles daily candles for the ticker symbols in the new records
		console.log(`removing existing daily records for ${getYMDdateString(dateObj)}...`);

		await dbCandleService.deleteCandles({
			tickerSymbolId: candles.map((candle) => candle.ticker_symbol_id),
			periodType: ECandlePeriodType.D,
			periodRange: {
				start: startOfDay(dateObj),
				end: endOfDay(dateObj)
			}
		});

		// create daily candle records
		console.log(`creating ${candles.length} daily records for ${getYMDdateString(dateObj)}...`);

		const numCreated = await dbCandleService.createCandles(candles);

		console.log(`${numCreated} candles created`);

		// create/update derivative candles
		if (this.updateDerivativePeriods) {
			const tickerSymbolIds = arrayUnique(candles.map((candle) => candle.ticker_symbol_id));

			for (const period of this.updateDerivativePeriods) {
				console.log(`creating/updating derivative candles: ${period}...`);

				const { insertCount, updateCount } = await candlesService.updateDerivativeCandles(
					tickerSymbolIds,
					period,
					dateObj
				);

				console.log(`${insertCount} created, ${updateCount} updated`);
			}
		}

		// process splits
		// TODO: split processing requires further testing
		/*
		const splitRecords = await polygonClientService.getStockSplitsForDate(dateObj);
		const processedSplitTickerSymbols: string[] = [];

		for (const splitRecord of splitRecords) {
			console.log(
				`Processing split for ${splitRecord.tickerSymbol} on ${splitRecord.executionDate} [${splitRecord.from} => ${splitRecord.to}]`
			);

			const splitTickerSymbolRecord = tickerSymbols.find(
				(record) => record.name === splitRecord.tickerSymbol && record.active
			);

			if (!splitTickerSymbolRecord) {
				console.log(
					`Error: Unable to find ticker symbol record for ${splitRecord.tickerSymbol}`
				);
				continue;
			}

			const numRowsProcessed = await tickerSymbolToolsService.processSplit(
				splitTickerSymbolRecord,
				splitRecord.executionDate,
				splitRecord.from,
				splitRecord.to
			);

			if (numRowsProcessed) {
				processedSplitTickerSymbols.push(splitRecord.tickerSymbol);
			} else {
				console.log(`Error: no candles processed for ${splitRecord.tickerSymbol} split`);
			}
		}
		*/

		return {
			importDate: getYMDdateString(dateObj),
			importCount: numCreated,
			notices,
			splitTickers: []
			// splitTickers: processedSplitTickerSymbols
		};
	}
}

export default ImportDailyCandleDataTask;
