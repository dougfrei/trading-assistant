import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { getYMDdateString, isValidYMDdateString } from '@trading-assistant/common';
import { endOfWeek, startOfWeek } from 'date-fns';
import { IDataloaders } from 'src/graphql-dataloader/GQLDataloader.service';
import { DbTickerSymbolEarningsService } from 'src/services/db/dbTickerSymbolEarnings.service';
import { TickerSymbol } from '../ticker-symbols/ticker.model';
import { TickerSymbolEarningsArgs } from './tickerSymbolEarnings.args';
import { TickerSymbolEarnings } from './tickerSymbolEarnings.model';

@Resolver(() => TickerSymbolEarnings)
export class TickerSymbolEarningsResolver {
	constructor(private readonly dbTickerSymbolEarningsService: DbTickerSymbolEarningsService) {}

	@Query(() => [TickerSymbolEarnings], { name: 'tickerSymbolEarnings' })
	async getTickerSymbolEarnings(
		@Args() args: TickerSymbolEarningsArgs
	): Promise<TickerSymbolEarnings[]> {
		// NOTE: using weekStartsOn 6 (Saturday), so that requests on Saturday will show the week ahead
		const startDate =
			args.startDate && isValidYMDdateString(args.startDate)
				? args.startDate
				: getYMDdateString(startOfWeek(new Date(), { weekStartsOn: 6 }));
		const endDate =
			args.endDate && isValidYMDdateString(args.endDate)
				? args.endDate
				: getYMDdateString(endOfWeek(new Date(), { weekStartsOn: 6 }));

		const records = await this.dbTickerSymbolEarningsService.getBetweenDates(
			startDate,
			endDate
		);

		return records.map((record) => TickerSymbolEarnings.fromEntity(record));
	}

	@ResolveField('tickerSymbol', () => TickerSymbol)
	async getTickerSymbolRecord(
		@Parent() tickerSymbolEarnings: TickerSymbolEarnings,
		@Context() { loaders }: { loaders: IDataloaders }
	) {
		return loaders.tickerSymbolsLoader.load(tickerSymbolEarnings.tickerSymbolId);
	}
}
