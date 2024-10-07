import { Argument, Command } from 'commander';
import { FileMigrationProvider, MigrationResultSet, Migrator } from 'kysely';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import CLITask from 'src/cli/cli-task';
import { Database } from 'src/db/db.module';
import * as v from 'valibot';

class DbMigrateTask extends CLITask {
	protected direction = 'latest';

	protected createCommanderTask(program: Command): void {
		program
			.command('db-migrate')
			.description('run migration actions on the DB')
			.addArgument(
				new Argument('<direction>', 'The migration direction').choices([
					'up',
					'down',
					'latest'
				])
			)
			.action(async (direction: string) => {
				this.direction = v.parse(
					v.optional(
						v.pipe(
							v.string(),
							v.transform((value) => value.toLowerCase().trim()),
							v.union(
								[v.literal('up'), v.literal('down'), v.literal('latest')],
								'direction must be "up", "down", or "latest"'
							)
						),
						'latest'
					),
					direction
				);

				await this.runMigration();
			});
	}

	protected async runMigration() {
		const db = this.app.get(Database);

		const migrator = new Migrator({
			db,
			provider: new FileMigrationProvider({
				fs,
				path,
				// This needs to be an absolute path.
				migrationFolder: path.join(__dirname, '..', '..', '..', 'src', 'db', 'migrations')
			})
		});

		let migrateMethod: keyof Migrator = 'migrateToLatest';

		if (this.direction === 'up') {
			migrateMethod = 'migrateUp';
		} else if (this.direction === 'down') {
			migrateMethod = 'migrateDown';
		}

		console.log(`running migration method - ${migrateMethod}`);

		const { error, results }: MigrationResultSet = await migrator[migrateMethod]();

		results?.forEach((it) => {
			if (it.status === 'Success') {
				console.log(`["${it.migrationName}"]: executed successfully`);
			} else if (it.status === 'Error') {
				console.error(`[${it.migrationName}]: failed to execute`);
			} else if (it.status === 'NotExecuted') {
				console.error(`[${it.migrationName}]: not executed`);
			}
		});

		if (error) {
			console.error('migration failed');
			console.error(error);
		}
	}
}

export default DbMigrateTask;
