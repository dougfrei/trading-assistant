import { Args, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import calculateVwapOhlc4 from 'src/analysis/indicators/vwapOHLC4';
import { DbCandleService, IGetCandlesArgs } from 'src/services/db/dbCandle.service';
import { getNYMarketOpenDateObject } from 'src/util/date';
import { AVWAPArgs } from './AVWAP.args';
import { AVWAPValue } from './AVWAPValue.model';

@Resolver(() => [AVWAPValue])
export class AVWAPResolver {
	constructor(private readonly dbCandleService: DbCandleService) {}

	@Query(() => [AVWAPValue])
	async AVWAP(@Args() args: AVWAPArgs): Promise<AVWAPValue[]> {
		try {
			const getCandlesArgs: IGetCandlesArgs = {
				periodType: args.periodType,
				order: 'period_asc'
			};

			if (args.startDate) {
				getCandlesArgs.periodCompare = getNYMarketOpenDateObject(args.startDate);
				getCandlesArgs.periodCompareOperator = '>=';
			}

			const candles = await this.dbCandleService.getCandlesByTickerSymbolName(
				args.tickerSymbol,
				getCandlesArgs
			);

			if (!candles.length) {
				throw new GraphQLError(
					`No ${args.periodType} candles available for ${args.tickerSymbol}`
				);
			}

			const values = calculateVwapOhlc4({
				open: candles.map((candle) => candle.open),
				low: candles.map((candle) => candle.low),
				high: candles.map((candle) => candle.high),
				close: candles.map((candle) => candle.close),
				volume: candles.map((candle) => candle.volume),
				twoDecimals: true
			});

			return values.map((value, index) => {
				const avwapValue = new AVWAPValue();

				avwapValue.period = candles[index]?.period.getTime() ?? 0;
				avwapValue.periodType = args.periodType;
				avwapValue.value = value;

				return avwapValue;
			});
		} catch (err: unknown) {
			throw new GraphQLError(err instanceof Error ? err.message : 'An error occurred');
		}
	}
}
