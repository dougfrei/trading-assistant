import { ECandlePeriodType, ETickerSymbolType, getYMDdateString } from '@trading-assistant/common';
import { Command } from 'commander';
import { existsSync } from 'node:fs';
import CLITask from 'src/cli/cli-task';
import FMPClientService from 'src/data-sources/FMPClient.service';
import FMPCloudClientService from 'src/data-sources/FMPCloudClient.service';
import { DataSourcesModule } from 'src/data-sources/dataSources.module';
import { DbTickerSymbolNew } from 'src/db/types/tables/tickerSymbols';
import { TickerSymbol } from 'src/entities/TickerSymbol.model';
import { CandleUtilitiesModule } from 'src/services/candle-utilities/candleUtilities.module';
import { CandlesService } from 'src/services/candle-utilities/candles.service';
import { DbCandleService } from 'src/services/db/dbCandle.service';
import { DbTickerSymbolService } from 'src/services/db/dbTickerSymbol.service';
import {
	getAverageVolumeForCandles,
	getCandlesHighLowValues,
	getMostRecentCandle
} from 'src/util/candle';
import { AVERAGE_NUMBER_OF_TRADING_DAYS_PER_YEAR, TRADING_DAYS_PER_YEAR } from 'src/util/constants';
import { etfTickerSymbols } from 'src/util/etfs';
import FMPTickerSymbolManager from 'src/util/fmp/fmp-ticker-symbol-manager';
import {
	TStooqZipEntries,
	getStooqArchiveMostRecentDate,
	getStooqZipEntries,
	parseStooqCSVcontent
} from 'src/util/stooq';
import { getTickerSymbolNameMap } from 'src/util/ticker-symbols';
import { valibotSchemas } from 'src/util/valibot';
import * as v from 'valibot';

const CLIProgress = require('cli-progress'); /* eslint-disable-line @typescript-eslint/no-require-imports */

interface IStooqDataImportResult {
	ticker: string;
	imported: number;
	derivativePeriodsGenerated: Record<string, number>;
	errors: string[];
	excludeReasons: {
		lowVolume: boolean;
		noTrades: boolean;
		underOneYear: boolean;
	};
}

class ImportBulkCandleDataTask extends CLITask {
	protected zipFilename = '';
	protected opts = {
		limit: AVERAGE_NUMBER_OF_TRADING_DAYS_PER_YEAR * 5,
		minAvgVol: 500_000,
		analyze: false
	};

	protected createCommanderTask(program: Command): void {
		// candleLimit = AVERAGE_NUMBER_OF_TRADING_DAYS_PER_YEAR * 5,
		// 	minAvgStockVolume = 500_000,
		// 	analyzeCandles = false

		program
			.command('import-bulk-candle-data')
			.description('Import bulk candle data from a Stooq archive')
			.argument('<archive-zip>', 'The Stooq archive file')
			.option(
				'-l, --limit <num-candles>',
				'The maximum amount of candles to import per ticker',
				(AVERAGE_NUMBER_OF_TRADING_DAYS_PER_YEAR * 5).toString()
			)
			.option(
				'--min-avg-vol <volume>',
				'Exclude ticker symbols that do not meet this minimum average volume over a 20-day average',
				(500_000).toString()
			)
			.option('-a, --analyze', 'Run the candle analyzers after the import', false)
			.action(async (zipFilename, opts) => {
				this.zipFilename = v.parse(
					valibotSchemas.nonEmptyString('zip filename must be a non-empty string'),
					zipFilename
				);

				this.opts = v.parse(
					v.object({
						limit: v.optional(
							v.pipe(v.unknown(), v.transform(Number), v.integer(), v.finite()),
							AVERAGE_NUMBER_OF_TRADING_DAYS_PER_YEAR * 5
						),
						minAvgVol: v.optional(
							v.pipe(v.unknown(), v.transform(Number), v.integer(), v.finite()),
							500_000
						),
						analyze: v.optional(v.pipe(v.unknown(), v.transform(Boolean)), false)
					}),
					opts
				);

				await this.bulkImport();
			});
	}

	async bulkImport() {
		const dbCandleService = this.app.get(DbCandleService);
		const fmpClientService = this.app.select(DataSourcesModule).get(FMPClientService);
		const fmpCloudClientService = this.app.select(DataSourcesModule).get(FMPCloudClientService);

		if (!this.zipFilename || !existsSync(this.zipFilename)) {
			throw new Error(`bulk import stooq zip file doesn't exist: ${this.zipFilename}`);
		}

		const zipEntries = getStooqZipEntries(this.zipFilename);

		console.log('deleting all existing candles...');
		const deleteCandlesCount = await dbCandleService.deleteAllCandles();
		console.log(`${deleteCandlesCount} candle records deleted`);

		console.log('loading ticker symbol data from FMP...');

		const fmpTickerSymbols = new FMPTickerSymbolManager(
			fmpClientService,
			fmpCloudClientService
		);

		await fmpTickerSymbols.init();

		let isError = false;

		try {
			await this.bulkImportETFs(zipEntries, fmpTickerSymbols, etfTickerSymbols);

			const importStocksResults = await this.bulkImportStocks(zipEntries, fmpTickerSymbols);

			console.log(
				`${importStocksResults.tickerSymbols.numCreated} ticker symbols created, ${importStocksResults.tickerSymbols.numSkipped} ticker symbols skipped`
			);
			console.log(`${importStocksResults.stocks.numCreated} stocks imported`);

			importStocksResults.stocks.errors.forEach((error) => console.log(error));
		} catch (err) {
			isError = true;

			console.error('error importing stooq data');
			console.error(err);
		}

		if (!isError && this.opts.analyze) {
			console.log('would analyze candles');
		}
	}

	protected async bulkImportETFs(
		zipEntries: TStooqZipEntries,
		fmpTickerSymbolManager: FMPTickerSymbolManager,
		useEtfTickerSymbols: string[] = []
	) {
		const dbTickerSymbolService = this.app.get(DbTickerSymbolService);

		const mostRecentDate = getStooqArchiveMostRecentDate(zipEntries);

		let allTickerSymbols = await dbTickerSymbolService.getTickerSymbols({
			type: ETickerSymbolType.ETF
		});

		const createETFTickerSymbolsData = useEtfTickerSymbols.reduce<DbTickerSymbolNew[]>(
			(acum, etfSymbol) => {
				const existingTickerSymbol = allTickerSymbols.find(
					(record) => record.name === etfSymbol
				);

				if (!existingTickerSymbol) {
					acum.push({
						type: ETickerSymbolType.ETF,
						name: etfSymbol,
						active: true
					});
				}

				return acum;
			},
			[]
		);

		if (createETFTickerSymbolsData.length) {
			console.log('creating ETF ticker symbols...');

			const etfTickerCreateCount = await dbTickerSymbolService.createTickerSymbols(
				createETFTickerSymbolsData
			);

			console.log(`${etfTickerCreateCount} ETF ticker symbols created`);

			allTickerSymbols = await dbTickerSymbolService.getTickerSymbols({
				type: ETickerSymbolType.ETF
			});
		} else {
			console.log('not creating any ETF ticker symbols');
		}

		const allTickerSymbolsMap = getTickerSymbolNameMap(allTickerSymbols);

		console.log('updating ETF DB records with labels and importing candles...');

		for (const etfSymbol of useEtfTickerSymbols) {
			const fmpEtfSymbol = fmpTickerSymbolManager.getBySymbol(etfSymbol);

			if (!fmpEtfSymbol) {
				console.log(`[ERROR] cannot find FMP record for ETF ticker symbol "${etfSymbol}"`);
				continue;
			}

			await dbTickerSymbolService.updateTickerSymbolByName(etfSymbol, {
				label: fmpEtfSymbol.name
			});

			const zipEntry = zipEntries.get(etfSymbol.toUpperCase());

			if (zipEntry) {
				const res = await this.importStooqSingleTickerCSVcontent({
					csvContent: zipEntry.getData().toString('utf-8'),
					tickerSymbolType: ETickerSymbolType.ETF,
					tickerSymbolRecordMap: allTickerSymbolsMap,
					limitCount: this.opts.limit,
					mostRecentDate,
					specificTickerSymbol: etfSymbol
				});

				console.log(`[${res.ticker}]: ${res.imported} candles created`);
			} else {
				console.log(
					`[ERROR] cannot find bulk file for ticker symbol "${etfSymbol}" (${fmpEtfSymbol.name})`
				);
			}
		}
	}

	protected async bulkImportStocks(
		zipEntries: TStooqZipEntries,
		fmpTickerSymbolManager: FMPTickerSymbolManager
	) {
		const dbTickerSymbolService = this.app.get(DbTickerSymbolService);
		const results: {
			stocks: {
				numCreated: number;
				errors: string[];
			};
			tickerSymbols: {
				numCreated: number;
				numSkipped: number;
			};
		} = {
			stocks: {
				numCreated: 0,
				errors: []
			},
			tickerSymbols: {
				numCreated: 0,
				numSkipped: 0
			}
		};
		const mostRecentDate = getStooqArchiveMostRecentDate(zipEntries);

		console.log(`importing filtered stocks [average volume >= ${this.opts.minAvgVol}]...`);

		const minAvgVolStocks = fmpTickerSymbolManager.filterSymbols({
			avgVolume: this.opts.minAvgVol,
			avgVolumeCompare: '>=',
			type: ETickerSymbolType.stock
		});

		const stocksWithZipEntries = minAvgVolStocks.filter((stock) => {
			const hasEntry = zipEntries.has(stock.symbol.toUpperCase());

			if (!hasEntry) {
				results.stocks.errors.push(
					`cannot find bulk file for "${stock.symbol}" (${stock.name})`
				);
			}

			return hasEntry;
		});

		let allTickerSymbols = await dbTickerSymbolService.getTickerSymbols();

		const createTickerSymbolsData = stocksWithZipEntries.reduce<DbTickerSymbolNew[]>(
			(acum, stockWithZipEntry) => {
				const hasExistingRecord = allTickerSymbols.some(
					(record) => record.name === stockWithZipEntry.symbol
				);

				if (hasExistingRecord) {
					results.tickerSymbols.numSkipped++;
				} else {
					acum.push({
						type: ETickerSymbolType.stock,
						name: stockWithZipEntry.symbol,
						label: stockWithZipEntry.name,
						active: true,
						market_cap: BigInt(stockWithZipEntry.marketCap)
					});
				}

				return acum;
			},
			[]
		);

		// TODO: since ticker symbols aren't deleted, it would be best to set the existing ones not included in the stocksWithZipEntries array to inactive

		results.tickerSymbols.numCreated =
			await dbTickerSymbolService.createTickerSymbols(createTickerSymbolsData);

		allTickerSymbols = await dbTickerSymbolService.getTickerSymbols({ order: 'name asc' });

		const allTickerSymbolsMap = getTickerSymbolNameMap(allTickerSymbols);

		const progressBar = new CLIProgress.SingleBar({
			format: 'Importing Stocks {bar} | {percentage}% | {value}/{total} | {tickerSymbol}',
			barCompleteChar: '\u2588',
			barIncompleteChar: '\u2591',
			hideCursor: true
		});

		progressBar.start(stocksWithZipEntries.length, 0, { tickerSymbol: '' });

		for (const stock of stocksWithZipEntries) {
			progressBar.increment({ tickerSymbol: stock.symbol });

			const zipEntry = zipEntries.get(stock.symbol.toUpperCase());

			if (!zipEntry) {
				results.stocks.errors.push(`no zip file entry for ${stock.symbol.toUpperCase()}`);

				// set the ticker symbol record as inactive
				if (stock.symbol) {
					await dbTickerSymbolService.updateTickerSymbolByName(stock.symbol, {
						active: false
					});
				}

				continue;
			}

			// load the entry content from the zip file
			const entryContent = zipEntry.getData().toString('utf-8');

			// check if the entry content is empty
			if (!entryContent.trim()) {
				results.stocks.errors.push(`file is empty: ${zipEntry.entryName}`);

				// set the ticker symbol record as inactive
				if (stock.symbol) {
					await dbTickerSymbolService.updateTickerSymbolByName(stock.symbol, {
						active: false
					});
				}

				continue;
			}

			const importResult = await this.importStooqSingleTickerCSVcontent({
				csvContent: entryContent,
				tickerSymbolType: ETickerSymbolType.stock,
				tickerSymbolRecordMap: allTickerSymbolsMap,
				limitCount: this.opts.limit,
				mostRecentDate,
				requiredAverageVolume: this.opts.minAvgVol,
				specificTickerSymbol: stock.symbol
			});

			if (!importResult.imported || importResult.errors.length) {
				// set the ticker symbol record as inactive
				if (importResult.ticker) {
					await dbTickerSymbolService.updateTickerSymbolByName(importResult.ticker, {
						active: false
					});
				}

				results.stocks.errors = [
					...results.stocks.errors,
					...importResult.errors.map((error) => `${stock.symbol.toUpperCase()}: ${error}`)
				];
			} else {
				results.stocks.numCreated++;
			}
		}

		progressBar.stop();

		return results;
	}

	async importStooqSingleTickerCSVcontent({
		csvContent,
		tickerSymbolType,
		tickerSymbolRecordMap,
		limitCount = 1260,
		mostRecentDate = '',
		requiredAverageVolume = 250000,
		averageVolumePeriod = 20,
		specificTickerSymbol = '',
		generateDerivativePeriods = [ECandlePeriodType.W]
	}: {
		csvContent: string;
		tickerSymbolType: ETickerSymbolType;
		// tickerSymbolRecords: TickerSymbol[];
		tickerSymbolRecordMap: Map<string, TickerSymbol>;
		limitCount?: number;
		mostRecentDate?: string;
		requiredAverageVolume?: number;
		averageVolumePeriod?: number;
		specificTickerSymbol?: string;
		generateDerivativePeriods?: ECandlePeriodType[];
	}): Promise<IStooqDataImportResult> {
		const dbCandleService = this.app.get(DbCandleService);
		const dbTickerSymbolService = this.app.get(DbTickerSymbolService);
		const candlesService = this.app.select(CandleUtilitiesModule).get(CandlesService);

		// const tickerDbRecord = await tickerSymbolRecords.find((tickerSymbol) => tickerSymbol.name === tickerSymbol);

		// if (!tickerDbRecord) {
		// 	tickerRes.errors.push(`no ticker DB record exists: ${tickerSymbol}`);
		// 	res.push(tickerRes);
		// 	continue;
		// }

		// parse the Stooq CSV file
		const parseRes = parseStooqCSVcontent(csvContent.trim(), {
			limitCount,
			singleTicker: specificTickerSymbol,
			calcHighLow: true
		});

		const availableTickerSymbols = Object.keys(parseRes.tickers);

		const tickerRes: IStooqDataImportResult = {
			ticker: specificTickerSymbol ? specificTickerSymbol : (availableTickerSymbols[0] ?? ''),
			imported: 0,
			derivativePeriodsGenerated: {},
			errors: [],
			excludeReasons: {
				lowVolume: false,
				noTrades: false,
				underOneYear: false
			}
		};

		if (!availableTickerSymbols.includes(tickerRes.ticker)) {
			tickerRes.errors.push(
				tickerRes.ticker
					? `No candles found for ticker symbol: ${tickerRes.ticker}`
					: 'No ticker symbols found in file'
			);
		}

		// throw immediately if there are any errors in parsing the Stooq CSV for the specified ticker
		if (parseRes.tickers[tickerRes.ticker].errors.length) {
			tickerRes.errors = parseRes.tickers[tickerRes.ticker].errors;

			return tickerRes;
		}

		const candles = parseRes.tickers[tickerRes.ticker].candles ?? [];
		let canProcess = true;

		const avgVol = getAverageVolumeForCandles(candles, averageVolumePeriod);

		if (avgVol < requiredAverageVolume) {
			canProcess = false;

			tickerRes.excludeReasons.lowVolume = true;
			tickerRes.errors.push(`Low ${averageVolumePeriod}-day average volume (${avgVol})`);

			// console.log(
			// 	`${tickerRes.ticker}: low ${averageVolumePeriod}-day average volume (${avgVol})`
			// );
		}

		if (mostRecentDate) {
			const mostRecentCandle = candles.at(-1);

			if (
				!mostRecentCandle ||
				getYMDdateString(mostRecentCandle.period) !== mostRecentDate ||
				!mostRecentCandle.volume
			) {
				canProcess = false;

				tickerRes.excludeReasons.noTrades = true;
				tickerRes.errors.push(`Did not trade on archive date [${mostRecentDate}]`);

				// console.log(
				// 	`${tickerRes.ticker}: did not trade on archive date [${mostRecentDate}]`
				// );
			}
		}

		if (canProcess && candles.length < TRADING_DAYS_PER_YEAR) {
			if (candles.length < TRADING_DAYS_PER_YEAR / 2) {
				canProcess = false;

				tickerRes.errors.push('Trading for under 1/2 year');

				// console.log(`${tickerRes.ticker}: trading for under 1/2 year`);
			} else {
				canProcess = avgVol >= requiredAverageVolume * 2;

				if (!canProcess) {
					tickerRes.errors.push(
						`Trading for under a year on less than 2x required volume (${
							requiredAverageVolume * 2
						})`
					);

					// console.log(
					// 	`${
					// 		tickerRes.ticker
					// 	}: trading for under a year on less than 2x required volume (${
					// 		requiredAverageVolume * 2
					// 	})`
					// );
				}
			}

			if (!canProcess) {
				tickerRes.excludeReasons.underOneYear = true;
			}
		}

		if (!canProcess) {
			return tickerRes;
		}

		const lastCandle = getMostRecentCandle(candles);
		// let tickerDbRecord =
		// 	tickerSymbolRecords.find((record) => record.name === tickerRes.ticker) ?? null;
		let tickerDbRecord = tickerSymbolRecordMap.get(tickerRes.ticker) ?? null;

		if (tickerDbRecord) {
			// update with last price and average daily volume
			await dbTickerSymbolService.updateTickerSymbolById(tickerDbRecord.id, {
				last_price: lastCandle?.close ?? 0,
				avg_daily_vol: avgVol
			});
		} else {
			// create new ticker record
			tickerDbRecord = await dbTickerSymbolService.createTickerSymbol({
				name: tickerRes.ticker,
				type: tickerSymbolType,
				last_price: lastCandle?.close ?? 0,
				avg_daily_vol: avgVol
			});
		}

		if (!tickerDbRecord) {
			tickerRes.errors.push(`failed to create ticker DB record: ${tickerRes.ticker}`);

			return tickerRes;
		}

		/* if (!tickerDbRecord) {
			const lastCandle = getMostRecentCandle(candles);

			tickerDbRecord = await dbTickerSymbolService.createTickerSymbol({
				name: tickerRes.ticker,
				type: tickerSymbolType,
				last_price: lastCandle?.close ?? 0,
				avg_daily_vol: avgVol
			});

			if (!tickerDbRecord) {
				tickerRes.errors.push(`failed to create ticker DB record: ${tickerRes.ticker}`);

				return tickerRes;
			}
		} */

		const numImported = await dbCandleService.createFromCandleObjects(
			tickerDbRecord.id,
			candles,
			{
				replace: true
			}
		);

		tickerRes.imported = numImported;

		for (const derivativePeriod of generateDerivativePeriods) {
			const numCreated = await candlesService.createDerivativeCandles(
				tickerDbRecord.id,
				derivativePeriod
			);

			tickerRes.derivativePeriodsGenerated[derivativePeriod] = numCreated;
		}

		// console.log(
		// 	`${tickerRes.ticker}: ${numImported} imported | ${weeklyCreated} weekly candles created`
		// );

		const ttmHighLow = getCandlesHighLowValues(candles, TRADING_DAYS_PER_YEAR);

		await dbTickerSymbolService.updateTickerSymbolByName(tickerRes.ticker, {
			all_time_high: parseRes.tickers[tickerRes.ticker].at_h,
			all_time_low: parseRes.tickers[tickerRes.ticker].at_l,
			ttm_high: ttmHighLow.high,
			ttm_low: ttmHighLow.low
		});

		return tickerRes;
	}
}

export default ImportBulkCandleDataTask;
