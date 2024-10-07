import { Command } from 'commander';
import CLITask from 'src/cli/cli-task';
import PolygonClientService from 'src/data-sources/PolygonClient.service';
import { DataSourcesModule } from 'src/data-sources/dataSources.module';
import { DbNYSEMarketHolidaysNew } from 'src/db/types/tables/nyseMarketHolidays';
import { DbNYSEMarketHolidaysService } from 'src/services/db/dbNYSEMarketHolidays';

class UpdateNYSEMarketHolidaysTask extends CLITask {
	protected createCommanderTask(program: Command): void {
		program
			.command('update-nyse-market-holidays')
			.description('Update NYSE market holiday records')
			.action(async () => {
				await this.updateNYSEMarketHolidays();
			});
	}

	protected async updateNYSEMarketHolidays() {
		const dbNYSEMarketHolidaysService = this.app.get(DbNYSEMarketHolidaysService);
		const polygonClientService = this.app.select(DataSourcesModule).get(PolygonClientService);
		const marketHolidayDTOobjects = await polygonClientService.getUpcomingMarketHolidays();

		const dbInsertRecords = marketHolidayDTOobjects.map<DbNYSEMarketHolidaysNew>((object) => ({
			date: object.dateYMD,
			is_early_close: object.isEarlyClose
		}));

		const numRowsAffected = await dbNYSEMarketHolidaysService.upsertMany(dbInsertRecords);

		console.log(`${numRowsAffected} rows affected`);
	}
}

export default UpdateNYSEMarketHolidaysTask;
