import { Injectable } from '@nestjs/common';
import { ECandlePeriodType, ETickerSymbolType } from '@trading-assistant/common';
import * as DataLoader from 'dataloader';
import { VWRRSAnalyzer } from 'src/analysis/analyzers/VWRRSAnalyzer';
import { Candle } from 'src/entities/Candle.model';
import { Candle as GQLCandle } from 'src/graphql/candles/candle.model';
import { TickerSymbolEarnings } from 'src/graphql/ticker-symbol-earnings/tickerSymbolEarnings.model';
import { TickerSymbol } from 'src/graphql/ticker-symbols/ticker.model';
import { TradeAccount } from 'src/graphql/trade-account/tradeAccount.model';
import { TradeTag } from 'src/graphql/trade-tags/tradeTag.model';
import { DbCandleService, IGetCandlesArgs } from 'src/services/db/dbCandle.service';
import { DbTickerSymbolService } from 'src/services/db/dbTickerSymbol.service';
import { DbTickerSymbolEarningsService } from 'src/services/db/dbTickerSymbolEarnings.service';
import { DbTradeAccountService } from 'src/services/db/dbTradeAccount.service';
import { DbTradeTagService } from 'src/services/db/dbTradeTag.service';
import { analyzeCandles } from 'src/util/analyze';
import { arrayUnique } from 'src/util/arrays';
import { DEFAULT_MARKET_TICKER_SYMBOL } from 'src/util/constants';
import { gcisSectorETFs } from 'src/util/etfs';
import * as v from 'valibot';

interface TTickerSymbolCandlesLoaderKey {
	tickerSymbolId: number;
	symbol: string;
	periodType: ECandlePeriodType;
	periodCount: number;
}

export interface IDataloaders {
	tradeAccountsLoader: DataLoader<number, TradeAccount | null>;
	tradeTagsLoader: DataLoader<number, TradeTag[]>;
	tickerSymbolsLoader: DataLoader<number, TickerSymbol>;
	tickerSymbolEarningsLoader: DataLoader<number, TickerSymbolEarnings[]>;
	sectorEtfTickerSymbolsLoader: DataLoader<string, TickerSymbol>;
	sectorTickerSymbolsLoader: DataLoader<string, TickerSymbol[]>;
	tickerSymbolCandlesLoader: DataLoader<string, GQLCandle[]>;
	candleRsRwLoader: DataLoader<string, number | null>;
	tradeTickerSymbolsLoader: DataLoader<string, TickerSymbol | null>;
}

export interface TCandleRSRWLoaderItem {
	candleObj: GQLCandle;
	compareTickerSymbol: string;
}

@Injectable()
export class GQLDataloaderService {
	constructor(
		private readonly dbCandleService: DbCandleService,
		private readonly dbTickerSymbolService: DbTickerSymbolService,
		private readonly dbTickerSymbolEarningsService: DbTickerSymbolEarningsService,
		private readonly dbTradeAccountService: DbTradeAccountService,
		private readonly dbTradeTagsService: DbTradeTagService
	) {}

	getLoaders(): IDataloaders {
		return {
			tradeAccountsLoader: this.createTradeAccountsLoader(),
			tradeTagsLoader: this.createTradeTagsLoader(),
			tickerSymbolsLoader: this.createTickerSymbolsLoader(),
			tickerSymbolEarningsLoader: this.createTickerSymbolEarningsLoader(),
			sectorEtfTickerSymbolsLoader: this.createSectorEtfTickerSymbolsLoader(),
			sectorTickerSymbolsLoader: this.createSectorTickerSymbolsLoader(),
			tickerSymbolCandlesLoader: this.createTickerSymbolCandlesLoader(),
			candleRsRwLoader: this.createCandleRsRwLoader(),
			tradeTickerSymbolsLoader: this.createTradeTickerSymbolsLoader()
		};
	}

	private createTradeAccountsLoader() {
		return new DataLoader<number, TradeAccount | null>(async (tradeAccountIds) => {
			const tradeAccounts = await this.dbTradeAccountService.getTradeAccounts({
				ids: arrayUnique(tradeAccountIds)
			});

			const mappedResults = tradeAccountIds.map((accountId) => {
				const foundEntity = tradeAccounts.find((account) => account.id === accountId);

				return foundEntity ? TradeAccount.fromEntity(foundEntity) : null;
			});

			return mappedResults;
		});
	}

	private createTradeTagsLoader() {
		return new DataLoader<number, TradeTag[]>(async (tradeIds) => {
			const tagsMap = await this.dbTradeTagsService.getTradeTagsForTradeIds(
				arrayUnique(tradeIds)
			);

			const mappedResults = tradeIds.map((tradeId) => tagsMap.get(tradeId) ?? []);

			return mappedResults;
		});
	}

	private createTickerSymbolsLoader() {
		return new DataLoader<number, TickerSymbol>(async (ids) => {
			const tickerSymbols = await this.dbTickerSymbolService.getTickerSymbols({
				ids: arrayUnique(ids)
			});

			const mappedResults = ids.map((id) => {
				const foundEntity = tickerSymbols.find((tickerSymbol) => tickerSymbol.id === id);

				return foundEntity ? TickerSymbol.fromEntity(foundEntity) : new TickerSymbol();
			});

			return mappedResults;
		});
	}

	private createTickerSymbolEarningsLoader() {
		return new DataLoader<number, TickerSymbolEarnings[]>(async (tickerSymbolIds) => {
			const earningsRecords =
				await this.dbTickerSymbolEarningsService.getForTickerSymbolIds(tickerSymbolIds);

			const mappedResults = tickerSymbolIds.map((id) =>
				earningsRecords
					.filter((earningsRecord) => earningsRecord.tickerSymbolId === id)
					.map((record) => TickerSymbolEarnings.fromEntity(record))
			);

			return mappedResults;
		});
	}

	private createSectorEtfTickerSymbolsLoader() {
		return new DataLoader<string, TickerSymbol>(async (gcisValues) => {
			const etfTickerSymbols = gcisValues.reduce<string[]>((acum, gcis) => {
				if (gcisSectorETFs[gcis]) {
					acum.push(gcisSectorETFs[gcis]);
				}

				return acum;
			}, []);

			const tickerSymbols = await this.dbTickerSymbolService.getTickerSymbols({
				names: Array.from(new Set(etfTickerSymbols))
			});

			const res = gcisValues.map((gcis) => {
				const foundRecord = tickerSymbols.find(
					(record) => record.name === gcisSectorETFs[gcis]
				);

				return foundRecord ? TickerSymbol.fromEntity(foundRecord) : new TickerSymbol();
			});

			return res;
		});
	}

	private createSectorTickerSymbolsLoader() {
		return new DataLoader<string, TickerSymbol[]>(async (keys) => {
			const gcisObjects = v.parse(
				v.array(
					v.object({
						gcis: v.string(),
						orderBy: v.string(),
						order: v.string()
					})
				),
				keys.map((key) => JSON.parse(key))
			);

			const tickerSymbols = await this.dbTickerSymbolService.getTickerSymbols({
				gcis: gcisObjects.map((gcisObj) => gcisObj.gcis),
				type: ETickerSymbolType.stock,
				order: 'name asc',
				active: true
			});

			const res = gcisObjects.map((gcisObj) => {
				const matchingRecords = tickerSymbols.filter(
					(record) => record.gcis.indexOf(gcisObj.gcis) === 0
				);

				switch (gcisObj.orderBy) {
					case 'name':
						matchingRecords.sort((a, b) => {
							if (a.label < b.label) {
								return gcisObj.order === 'asc' ? -1 : 1;
							}

							if (a.label > b.label) {
								return gcisObj.order === 'asc' ? 1 : -1;
							}

							return 0;
						});
						break;

					case 'symbol':
					default:
						matchingRecords.sort((a, b) => {
							if (a.name < b.name) {
								return gcisObj.order === 'asc' ? -1 : 1;
							}

							if (a.name > b.name) {
								return gcisObj.order === 'asc' ? 1 : -1;
							}

							return 0;
						});
						break;
				}

				return matchingRecords.map((record) => TickerSymbol.fromEntity(record));
			});

			return res;
		});
	}

	private createTickerSymbolCandlesLoader() {
		return new DataLoader<string, GQLCandle[]>(async (keys) => {
			if (!keys.length) {
				return [];
			}

			const keyObjects: TTickerSymbolCandlesLoaderKey[] = keys.map((key) => JSON.parse(key));

			const periodType: ECandlePeriodType = keyObjects[0].periodType;
			const periodCount: number = keyObjects[0].periodCount;

			keyObjects.forEach((keyObj) => {
				if (keyObj.periodType !== periodType || keyObj.periodCount !== periodCount) {
					throw new Error(
						'tickerSymbolCandlesLoader -- inconsistent parameters in keys; this should not happen'
					);
				}
			});

			const tickerSymbolIds = keyObjects.map((keyObj) => keyObj.tickerSymbolId);

			const refCandles = await this.dbCandleService.getCandlesByTickerSymbolName(
				DEFAULT_MARKET_TICKER_SYMBOL,
				{
					periodType,
					order: 'period_desc',
					limit: periodCount
				}
			);

			const getCandlesArgs: IGetCandlesArgs = {
				periodType,
				order: 'period_desc'
			};

			const oldestPeriod = refCandles.at(-1)?.period;

			if (oldestPeriod) {
				getCandlesArgs.periodCompare = oldestPeriod;
				getCandlesArgs.periodCompareOperator = '>=';
			}

			const candles = await this.dbCandleService.getCandlesByTickerSymbolId(
				tickerSymbolIds,
				getCandlesArgs
			);

			const mappedResults = tickerSymbolIds.map((tickerSymbolId) =>
				candles
					.filter((candle) => candle.tickerSymbolId === tickerSymbolId)
					.slice(0, periodCount)
					.map((record) => GQLCandle.fromEntity(record))
			);

			return mappedResults;
		});
	}

	private createCandleRsRwLoader() {
		return new DataLoader<string, number | null>(async (keys) => {
			// TODO: add support for comparing to a set of reference candles that is shorter than the source candles

			if (!keys.length) {
				return [];
			}

			// decode the string keys into objects
			const keyObjects: TCandleRSRWLoaderItem[] = keys.map<TCandleRSRWLoaderItem>((key) => {
				const data = JSON.parse(key);

				return {
					candleObj: data.candleObj,
					compareTickerSymbol: data.compareTickerSymbol
				};
			});

			const compareTickerSymbolName = keyObjects[0].compareTickerSymbol;
			const sourcePeriodType = keyObjects[0].candleObj.periodType;
			const sourceTickerSymbolId = keyObjects[0].candleObj.tickerSymbolId;

			if (
				!keyObjects.every(
					(keyObj) => keyObj.compareTickerSymbol === compareTickerSymbolName
				)
			) {
				throw new Error(
					'multiple compare ticker symbols received in candle RS/RW loader -- this should not happen'
				);
			}

			if (!keyObjects.every((keyObj) => keyObj.candleObj.periodType === sourcePeriodType)) {
				throw new Error(
					'multiple period types received in candle RS/RW loader -- this should not happen'
				);
			}

			if (
				!keyObjects.every(
					(keyObj) => keyObj.candleObj.tickerSymbolId === sourceTickerSymbolId
				)
			) {
				throw new Error(
					'multiple source ticker symbol IDs in candle RS/RW loader -- this should not happen'
				);
			}

			const candles = keyObjects.map(
				(keyObj) =>
					new Candle({
						open: keyObj.candleObj.open ?? 0,
						high: keyObj.candleObj.high ?? 0,
						low: keyObj.candleObj.low ?? 0,
						close: keyObj.candleObj.close ?? 0,
						volume: keyObj.candleObj.volume ?? 0,
						period: new Date(keyObj.candleObj.period ?? ''),
						periodType: keyObj.candleObj.periodType
					})
			);

			const compareCandles = await this.dbCandleService.getCandlesByTickerSymbolName(
				compareTickerSymbolName,
				{
					periodType: sourcePeriodType,
					order: 'period_asc',
					periodCompare: candles[0].period,
					periodCompareOperator: '>='
				}
			);

			const indicatorKey = `vwrrs_${compareTickerSymbolName}`;
			const analyzer = new VWRRSAnalyzer({
				indicatorKey,
				refCandles: compareCandles,
				refLabel: compareTickerSymbolName,
				refTickerSymbol: compareTickerSymbolName
			});

			const [, analyzedCandles] = analyzeCandles(candles, [analyzer]);

			const arraysInSync = candles.every(
				(candle, index) => candle.period === analyzedCandles[index].period
			);

			if (!arraysInSync) {
				throw new Error(
					'analyzed candle array is not in sync with the original candles array'
				);
			}

			const res = analyzedCandles.map(
				(candle) => candle.indicators.get(indicatorKey) ?? null
			);

			return res;
		});
	}

	private createTradeTickerSymbolsLoader() {
		return new DataLoader<string, TickerSymbol | null>(async (tickerSymbolNames) => {
			const tickerSymbolRecords = await this.dbTickerSymbolService.getTickerSymbols({
				names: arrayUnique(tickerSymbolNames)
			});

			const tickerSymbolsMap = new Map(
				tickerSymbolRecords.map((record) => [record.name, record])
			);

			const returnValues = tickerSymbolNames.map((tickerSymbolName) => {
				const matchingRecord = tickerSymbolsMap.get(tickerSymbolName);

				return matchingRecord ? TickerSymbol.fromEntity(matchingRecord) : null;
			});

			return returnValues;
		});
	}
}
