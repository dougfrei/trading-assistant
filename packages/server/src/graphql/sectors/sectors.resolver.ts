import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
// import DataLoader from 'dataloader';
import { GraphQLError } from 'graphql';
import ESectorsSortMethod from 'src/enums/ESectorsSortMethod';
import { IDataloaders } from 'src/graphql-dataloader/GQLDataloader.service';
import { GCISManagerService } from 'src/services/gcisManager.service';
import { TickerSymbol } from '../ticker-symbols/ticker.model';
import { Sector } from './sector.model';

@Resolver(() => Sector)
export class SectorsResolver {
	constructor(private readonly gcisManagerService: GCISManagerService) {}

	@Query(() => Sector, { name: 'sector' })
	async getSector(@Args('gcis', { type: () => String }) gcis: string): Promise<Sector> {
		const gcisRecord = this.gcisManagerService.getSector(gcis);

		if (!gcisRecord) {
			throw new GraphQLError(`No sector found for GCIS value '${gcis}'`);
		}

		return Sector.fromGCISrecord(gcisRecord);
	}

	@Query(() => [Sector], { name: 'sectors' })
	async getSectors(
		@Args('sort', { type: () => ESectorsSortMethod, defaultValue: ESectorsSortMethod.NAME_ASC })
		sort: ESectorsSortMethod
	): Promise<Sector[]> {
		return this.gcisManagerService
			.getAllSectors(sort)
			.map((record) => Sector.fromGCISrecord(record));
	}

	@ResolveField('etfTickerSymbol', () => TickerSymbol)
	async getEtfTickerSymbol(
		@Parent() sector: Sector,
		// @Context('sectorEtfTickerSymbolsLoader')
		// sectorEtfTickerSymbolsLoader: DataLoader<string, TickerSymbol>
		@Context() { loaders }: { loaders: IDataloaders }
	) {
		return loaders.sectorEtfTickerSymbolsLoader.load(sector.gcis);
	}

	@ResolveField('tickerSymbols', () => [TickerSymbol])
	async getTickerSymbols(
		@Parent() sector: Sector,
		@Args('orderBy', { type: () => String, defaultValue: 'symbol' })
		orderBy: string,
		@Args('order', { type: () => String, defaultValue: 'asc' }) order: string,
		// @Context('sectorTickerSymbolsLoader')
		// sectorTickerSymbolsLoader: DataLoader<string, TickerSymbol[]>
		@Context() { loaders }: { loaders: IDataloaders }
	) {
		const key = JSON.stringify({
			gcis: sector.gcis,
			orderBy,
			order
		});

		return loaders.sectorTickerSymbolsLoader.load(key);
	}
}
