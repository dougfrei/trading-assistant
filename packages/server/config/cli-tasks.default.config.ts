import CLITask from 'src/cli/cli-task';
import AnalyzeCandlesTask from 'src/cli/tasks/analyze-candles';
import AssociateSectorsTask from 'src/cli/tasks/associate-sectors';
import DbMigrateTask from 'src/cli/tasks/db-migrate';
import DbSeedTask from 'src/cli/tasks/db-seed';
import ImportBulkCandleDataTask from 'src/cli/tasks/import-bulk-candle-data';
import ImportDailyCandleDataTask from 'src/cli/tasks/import-daily-candle-data';
import ParseWikipediaGCISTask from 'src/cli/tasks/parse-wikipedia-gcis';
import UpdateNYSEMarketHolidaysTask from 'src/cli/tasks/update-nyse-market-holidays';

const cliTasks: (typeof CLITask)[] = [
	ImportBulkCandleDataTask,
	ImportDailyCandleDataTask,
	ParseWikipediaGCISTask,
	AssociateSectorsTask,
	AnalyzeCandlesTask,
	UpdateNYSEMarketHolidaysTask,
	DbMigrateTask,
	DbSeedTask
];

export default cliTasks;
