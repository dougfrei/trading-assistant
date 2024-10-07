import { Command } from 'commander';
import { PriceActionAnalyzer } from 'src/analysis/analyzers/PriceActionAnalyzer';
import CLITask from 'src/cli/cli-task';
import { Database } from 'src/db/db.module';

class DbSeedTask extends CLITask {
	protected createCommanderTask(program: Command): void {
		program
			.command('db-seed')
			.description('seed the database with initial data')
			.action(async () => {
				console.log('Seeding the database with initial data');

				await this.createScreenerQueries();

				console.log('Done');
			});
	}

	protected async createScreenerQueries() {
		const db = this.app.get(Database);

		console.log('Creating screener queries...');

		await db
			.insertInto('screener_queries')
			.values([
				{
					label: 'High Relative Volume',
					description:
						'Find stocks with a current relative volume greater than or equal to 2',
					query: JSON.stringify({
						logic: 'and',
						conditions: [
							{
								leftValue: 'rvol',
								operator: '>=',
								rightValue: 2
							}
						]
					})
				},
				{
					label: 'Above SMA 50/100/200',
					description: '',
					query: JSON.stringify({
						logic: 'and',
						conditions: [
							{
								leftValue: 'sma_50',
								operator: '<',
								rightValue: '#close'
							},
							{
								leftValue: 'sma_100',
								operator: '<',
								rightValue: '#close'
							},
							{
								leftValue: 'sma_200',
								operator: '<',
								rightValue: '#close'
							}
						]
					})
				},
				{
					label: 'Below SMA 50/100/200',
					description: '',
					query: JSON.stringify({
						logic: 'and',
						conditions: [
							{
								leftValue: 'sma_50',
								operator: '>',
								rightValue: '#close'
							},
							{
								leftValue: 'sma_100',
								operator: '>',
								rightValue: '#close'
							},
							{
								leftValue: 'sma_200',
								operator: '>',
								rightValue: '#close'
							}
						]
					})
				},
				{
					label: 'LRSI upward trend start',
					description: '',
					query: JSON.stringify({
						logic: 'and',
						conditions: [
							{
								logic: 'or',
								conditions: ['lrsi_slow_uptrend_start', 'lrsi_fast_uptrend_start']
							},
							{
								leftValue: 'rvol',
								operator: '>=',
								rightValue: 1.5
							}
						]
					})
				},
				{
					label: 'LRSI upward trend confirm',
					description: '',
					query: JSON.stringify({
						logic: 'and',
						conditions: [
							{
								logic: 'or',
								conditions: ['lrsi_slow_uptrend_start', 'lrsi_slow_break_os_up']
							},
							{
								leftValue: 'lrsi_fast',
								operator: '>',
								rightValue: 0
							}
						]
					})
				},
				{
					label: 'Bearish hammer on increasing volume',
					description: '',
					query: JSON.stringify({
						logic: 'and',
						conditions: [PriceActionAnalyzer.ALERT_BEAR_HAMMER_VOLUME_INCREASE]
					})
				},
				{
					label: 'Bullish hammer on increasing volume',
					description: '',
					query: JSON.stringify({
						logic: 'and',
						conditions: [PriceActionAnalyzer.ALERT_BULL_HAMMER_VOLUME_INCREASE]
					})
				}
			])
			.executeTakeFirstOrThrow();
	}
}

export default DbSeedTask;
