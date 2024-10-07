import { Args, Query, Resolver } from '@nestjs/graphql';
import {
	addDays,
	addMonths,
	addWeeks,
	addYears,
	eachDayOfInterval,
	eachMonthOfInterval,
	eachWeekOfInterval,
	eachYearOfInterval,
	endOfDay,
	endOfMonth,
	endOfWeek,
	endOfYear,
	startOfDay,
	startOfMonth,
	startOfWeek,
	startOfYear
} from 'date-fns';
import ETradePerformancePeriodType from 'src/enums/ETradePerformancePeriodType';
import { DbTradeService, IGetTradesParams } from 'src/services/db/dbTrade.service';
import { twoDecimals } from 'src/util/math';
import { getTradeIsScratch, getTradePnL } from 'src/util/trade-positions';
import { calculateProfitFactor, calculateWinRate } from 'src/util/trades';
import GetTradePerformancePeriodsArgs from './getTradePerformancePeriod.args';
import { TradePerformance } from './tradePerformance.model';
import { TradePerformancePeriod } from './tradePerformancePeriod.model';

@Resolver(() => TradePerformance)
export class TradePerformanceResolver {
	constructor(private readonly dbTradeService: DbTradeService) {}

	@Query(() => TradePerformance, { name: 'tradePerformance' })
	async getTradePerformance(
		@Args() args: GetTradePerformancePeriodsArgs
	): Promise<TradePerformance> {
		const { startDate, numPeriods, periodType, accountId, instrumentType } = args;

		let whereStartDate = startDate;
		let whereEndDate = startDate;
		let dateIntervals: Date[] = [];

		switch (periodType) {
			case ETradePerformancePeriodType.DAY:
				whereStartDate = startOfDay(startDate);
				whereEndDate = endOfDay(addDays(startDate, numPeriods - 1));
				dateIntervals = eachDayOfInterval({
					start: whereStartDate,
					end: whereEndDate
				});
				break;

			case ETradePerformancePeriodType.WEEK:
				whereStartDate = startOfWeek(startDate);
				whereEndDate = endOfWeek(addWeeks(whereStartDate, numPeriods - 1));
				dateIntervals = eachWeekOfInterval({
					start: whereStartDate,
					end: whereEndDate
				});
				break;

			case ETradePerformancePeriodType.MONTH:
				whereStartDate = startOfMonth(startDate);
				whereEndDate = endOfMonth(addMonths(whereStartDate, numPeriods - 1));
				dateIntervals = eachMonthOfInterval({
					start: whereStartDate,
					end: whereEndDate
				});
				break;

			case ETradePerformancePeriodType.YEAR:
				whereStartDate = startOfYear(startDate);
				whereEndDate = endOfYear(addYears(whereStartDate, numPeriods - 1));
				dateIntervals = eachYearOfInterval({
					start: whereStartDate,
					end: whereEndDate
				});
				break;

			default:
				break;
		}

		const whereParams: IGetTradesParams = {
			betweenDates: {
				start: whereStartDate,
				end: whereEndDate
			}
		};

		if (accountId) {
			whereParams.accountId = accountId;
		}

		if (instrumentType) {
			whereParams.instrumentType = instrumentType;
		}

		const trades = await this.dbTradeService.getTrades(whereParams);

		const periods = dateIntervals.map((interval, index, srcArray) => {
			const nextInterval = srcArray[index + 1] ?? null;
			const periodTrades = trades.filter((trade) => {
				if (!trade.closeDateTime) {
					return false;
				}

				return nextInterval
					? trade.closeDateTime >= interval && trade.closeDateTime < nextInterval
					: trade.closeDateTime >= interval;
			});

			const period = new TradePerformancePeriod();

			period.periodType = periodType;
			period.period = interval;
			period.pnl = twoDecimals(
				periodTrades.reduce((total, trade) => total + getTradePnL(trade.positions), 0)
			);
			period.numWinners = periodTrades.filter(
				(trade) => getTradePnL(trade.positions) > 0 && !getTradeIsScratch(trade.positions)
			).length;
			period.numLosers = periodTrades.filter(
				(trade) => getTradePnL(trade.positions) < 0 && !getTradeIsScratch(trade.positions)
			).length;
			period.numScratch = periodTrades.filter((trade) =>
				getTradeIsScratch(trade.positions)
			).length;
			period.winRate = calculateWinRate(
				period.numWinners,
				period.numLosers + period.numScratch
			); // TODO: scratch trades shouldn't be included in this calculation
			period.profitFactor = calculateProfitFactor(
				periodTrades.map((trade) => getTradePnL(trade.positions))
			);

			return period;
		});

		const totalWinners = periods.reduce((acum, period) => acum + period.numWinners, 0);
		const totalLosers = periods.reduce((acum, period) => acum + period.numLosers, 0);
		const totalScratch = periods.reduce((acum, period) => acum + period.numScratch, 0);

		return {
			totalPnl: twoDecimals(periods.reduce((acum, period) => acum + period.pnl, 0)),
			totalWinRate: calculateWinRate(totalWinners, totalLosers + totalScratch),
			totalProfitFactor: calculateProfitFactor(
				trades.map((trade) => getTradePnL(trade.positions))
			),
			totalWinners,
			totalLosers,
			totalScratch,
			periods
		};
	}
}
