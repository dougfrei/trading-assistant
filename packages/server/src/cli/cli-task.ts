import { INestApplicationContext } from '@nestjs/common';
import { Command } from 'commander';

class CLITask {
	protected app: INestApplicationContext;

	constructor(program: Command, app: INestApplicationContext) {
		this.app = app;
		this.createCommanderTask(program);
	}

	protected createCommanderTask(
		program: Command /* eslint-disable-line @typescript-eslint/no-unused-vars */
	) {
		console.error('no createCommanderTask defined for process');
	}
}

export default CLITask;
