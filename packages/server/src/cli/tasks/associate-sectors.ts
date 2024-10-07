import { ETickerSymbolType } from '@trading-assistant/common';
import { Command } from 'commander';
import CLITask from 'src/cli/cli-task';
import FMPCloudClientService from 'src/data-sources/FMPCloudClient.service';
import { DataSourcesModule } from 'src/data-sources/dataSources.module';
import {
	DbTickerSymbolService,
	IGetTickerSymbolsParams
} from 'src/services/db/dbTickerSymbol.service';
import FMPGCISManager from 'src/util/fmp/fmp-gcis-manager';

class AssociateSectorsTask extends CLITask {
	protected createCommanderTask(program: Command): void {
		program
			.command('associate-sectors')
			.description('Associate ticker symbols with their respective sector record')
			.action(async () => {
				await this.associateSectors();
			});
	}

	protected async associateSectors() {
		await this.updateTickerSymbolsGCIS();
		await this.updateTickerSymbolsMarketCap();
	}

	protected async updateTickerSymbolsGCIS(tickerSymbolNames: string[] = []): Promise<void> {
		const dbTickerSymbolService = this.app.get(DbTickerSymbolService);
		const fmpCloudClientService = this.app.select(DataSourcesModule).get(FMPCloudClientService);
		const gcisManager = new FMPGCISManager();

		const whereConditions: IGetTickerSymbolsParams = {
			type: ETickerSymbolType.stock
		};

		if (tickerSymbolNames.length) {
			whereConditions.names = tickerSymbolNames;
		}

		const tickerSymbolRecords = await dbTickerSymbolService.getTickerSymbols(whereConditions);

		const screenerRecords =
			await fmpCloudClientService.getDefaultExchangesStockScreenerResults();

		for (const tickerSymbolRecord of tickerSymbolRecords) {
			const screenerRecord = screenerRecords.find(
				(record) => record.symbol === tickerSymbolRecord.name
			);

			if (!screenerRecord) {
				console.log(`${tickerSymbolRecord.name}: no screener record`);
				continue;
			}

			const gcis = gcisManager.getGCIS(
				(screenerRecord.sector ?? '').trim(),
				(screenerRecord.industry ?? '').trim()
			);

			if (!gcis) {
				console.log(
					`${tickerSymbolRecord.name}: no GCIS value (${screenerRecord.sector} | ${screenerRecord.industry})`
				);
				continue;
			}

			await dbTickerSymbolService.updateTickerSymbolById(tickerSymbolRecord.id, {
				gcis
			});
		}
	}

	protected async updateTickerSymbolsMarketCap(tickerSymbolNames: string[] = []): Promise<void> {
		const dbTickerSymbolService = this.app.get(DbTickerSymbolService);
		const fmpCloudClientService = this.app.select(DataSourcesModule).get(FMPCloudClientService);

		const whereConditions: IGetTickerSymbolsParams = {};

		if (tickerSymbolNames.length) {
			whereConditions.names = tickerSymbolNames;
		}

		const tickerSymbolRecords = await dbTickerSymbolService.getTickerSymbols(whereConditions);

		const screenerRecords =
			await fmpCloudClientService.getDefaultExchangesStockScreenerResults();

		for (const tickerSymbolRecord of tickerSymbolRecords) {
			const screenerRecord = screenerRecords.find(
				(record) => record.symbol === tickerSymbolRecord.name
			);

			if (!screenerRecord) {
				console.log(`${tickerSymbolRecord.name}: no screener record`);
				continue;
			}

			await dbTickerSymbolService.updateTickerSymbolById(tickerSymbolRecord.id, {
				market_cap: BigInt(screenerRecord.marketCap)
			});
		}
	}
}

export default AssociateSectorsTask;
