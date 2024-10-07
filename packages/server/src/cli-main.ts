import { NestFactory } from '@nestjs/core';
import { Command } from 'commander';
import { resolve as resolvePath } from 'node:path';
import { AppConfigModule } from 'src/app-config/appConfig.module';
import { AppConfigService } from 'src/app-config/appConfig.service';
import { AppGlobalsService } from 'src/app-globals/appGlobals.service';
import { initAppBootstrapRequirements } from 'src/util/bootstrap';
import { CLIAppModule } from './cli-app.module';

(async () => {
	await initAppBootstrapRequirements();

	const app = await NestFactory.createApplicationContext(CLIAppModule);

	app.get(AppGlobalsService).rootPath = resolvePath(__dirname, '..');

	const appConfig = app.select(AppConfigModule).get(AppConfigService);

	const taskClasses = await appConfig.getCLItasks();

	const program = new Command();

	program
		.name('Trading Assistant CLI')
		.description('A collection of various tools for managing data within the application');

	taskClasses.forEach((taskClass) => {
		new taskClass(program, app);
	});

	try {
		await program.parseAsync();
	} catch (err: unknown) {
		program.error(err instanceof Error ? err.message : 'An unknown error occurred');
	}

	await app.close();

	process.exit(0);
})();
