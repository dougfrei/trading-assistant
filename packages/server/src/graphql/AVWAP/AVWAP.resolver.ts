import { Args, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import VWAP from 'src/analysis/indicators/VWAP';
import { DbCandleService, IGetCandlesArgs } from 'src/services/db/dbCandle.service';
import { isCandleIndicatorNumericValue } from 'src/util/candle';
import { getNYMarketOpenDateObject } from 'src/util/date';
import { twoDecimals } from 'src/util/math';
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

			const vwap = new VWAP();
			vwap.applyFormatter((value) =>
				isCandleIndicatorNumericValue(value) ? twoDecimals(value) : value
			);

			return candles.map((candle) => {
				const vwapValue = vwap.push({
					open: candle.open,
					high: candle.high,
					low: candle.low,
					close: candle.close,
					volume: candle.volume
				});

				const avwapValue = new AVWAPValue();

				avwapValue.period = candle.period.getTime() ?? 0;
				avwapValue.periodType = args.periodType;
				avwapValue.value = isCandleIndicatorNumericValue(vwapValue) ? vwapValue : 0;

				return avwapValue;
			});
		} catch (err: unknown) {
			throw new GraphQLError(err instanceof Error ? err.message : 'An error occurred');
		}
	}
}
