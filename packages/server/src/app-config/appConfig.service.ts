import { Injectable, Logger } from '@nestjs/common';
import { ECandlePeriodType } from '@trading-assistant/common';
import { resolve as resolvePath } from 'node:path';
import BaseAnalyzer from 'src/analysis/BaseAnalyzer';
import { AppGlobalsService } from 'src/app-globals/appGlobals.service';
import CLITask from 'src/cli/cli-task';
import IAnalyzerGroupParams from 'src/interfaces/IAnalyzerGroupParams';

@Injectable()
export class AppConfigService {
	private readonly logger = new Logger(AppConfigService.name);

	protected hasLoadedAnalyzerConfig = false;
	protected hasLoadedCLItasksConfig = false;
	protected analyzersByPeriodType = new Map<
		ECandlePeriodType,
		(params: IAnalyzerGroupParams) => BaseAnalyzer[]
	>();
	protected cliTasks: (typeof CLITask)[] = [];

	constructor(private appGlobals: AppGlobalsService) {}

	getConfigPath(filename: string) {
		return resolvePath(this.appGlobals.rootPath, 'config', filename);
	}

	async loadAnalyzersConfig() {
		if (this.hasLoadedAnalyzerConfig) {
			return;
		}

		this.hasLoadedAnalyzerConfig = true;

		const customAnalyzerConfigFile = this.getConfigPath('analyzers.config');
		const defaultAnalyzerConfigFile = this.getConfigPath('analyzers.default.config');

		let configObj: Record<ECandlePeriodType, BaseAnalyzer[]> | null = null;

		try {
			const { default: customConfig } = await import(customAnalyzerConfigFile);

			configObj = customConfig ?? null;
		} catch (err: unknown /* eslint-disable-line @typescript-eslint/no-unused-vars */) {
			// no need for an error here since this is a non-necessary custom config
		}

		if (!configObj) {
			try {
				const { default: defaultConfig } = await import(defaultAnalyzerConfigFile);

				configObj = defaultConfig ?? null;
			} catch (err) {
				this.logger.error(
					`Unable to load default analyzer config from ${defaultAnalyzerConfigFile} - ${err instanceof Error ? err.message : ''}`
				);
			}
		}

		if (!configObj) {
			this.logger.error('No analyzer config file could be loaded');
			return;
		}

		(Object.keys(configObj) as ECandlePeriodType[]).forEach((periodType) => {
			if (typeof configObj[periodType] !== 'function') {
				return;
			}

			this.analyzersByPeriodType.set(periodType as ECandlePeriodType, configObj[periodType]);
		});
	}

	async getAnalyzerConfigForPeriodType(
		periodType: ECandlePeriodType,
		params: IAnalyzerGroupParams
	): Promise<BaseAnalyzer[]> {
		await this.loadAnalyzersConfig();

		const getAnalyzersFunc = this.analyzersByPeriodType.get(periodType);

		if (!getAnalyzersFunc) {
			return [];
		}

		return getAnalyzersFunc(params);
	}

	async loadCLITasksConfig() {
		if (this.hasLoadedCLItasksConfig) {
			return;
		}

		this.hasLoadedCLItasksConfig = true;

		const customAnalyzerConfigFile = this.getConfigPath('cli-tasks.config');
		const defaultAnalyzerConfigFile = this.getConfigPath('cli-tasks.default.config');

		let configObj: (typeof CLITask)[] | null = null;

		try {
			const { default: customConfig } = await import(customAnalyzerConfigFile);

			configObj = Array.isArray(customConfig) ? customConfig : null;
		} catch (err: unknown /* eslint-disable-line @typescript-eslint/no-unused-vars */) {
			// no need for an error here since this is a non-necessary custom config
		}

		if (!configObj) {
			try {
				const { default: defaultConfig } = await import(defaultAnalyzerConfigFile);

				configObj = Array.isArray(defaultConfig) ? defaultConfig : null;
			} catch (err) {
				this.logger.error(
					`Unable to load default CLI tasks config from ${defaultAnalyzerConfigFile} - ${err instanceof Error ? err.message : ''}`
				);
			}
		}

		if (!configObj) {
			this.logger.error('No CLI tasks config file could be loaded');
			return;
		}

		this.cliTasks = configObj.filter(
			(item) => typeof item === 'function' && item.prototype instanceof CLITask
		);
	}

	async getCLItasks() {
		await this.loadCLITasksConfig();

		return this.cliTasks;
	}
}
