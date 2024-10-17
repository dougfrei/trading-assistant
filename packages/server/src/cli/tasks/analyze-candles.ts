import { ECandlePeriodType } from '@trading-assistant/common';
import { Command } from 'commander';
import CLITask from 'src/cli/cli-task';
import { CandleAnalysisService } from 'src/services/candle-utilities/candleAnalysis.service';
import { CandleUtilitiesModule } from 'src/services/candle-utilities/candleUtilities.module';
import * as v from 'valibot';

const CLIProgress = require('cli-progress'); /* eslint-disable-line @typescript-eslint/no-require-imports */

class AnalyzeCandlesTask extends CLITask {
	protected tickerSymbols: string[] = [];
	protected deltaUpdate = false;
	protected verboseMode = false;

	protected createCommanderTask(program: Command): void {
		program
			.command('analyze-candles')
			.description('Run analyzers on the candle records')
			.argument('[ticker-symbols]', 'The ticker symbols to analyze separated by commas', '')
			.option(
				'-d, --delta',
				'Run a delta update, updating only the most recent candle',
				false
			)
			.option(
				'-v, --verbose',
				'Enable verbose mode containing detailed import information',
				false
			)
			.action(async (tickerSymbols: string, opts: { delta: boolean; verbose: boolean }) => {
				const tickerSymbolsArray = tickerSymbols
					.split(',')
					.filter((value) => value.trim().length > 0);

				this.tickerSymbols = v.parse(
					v.array(
						v.pipe(
							v.string(),
							v.trim(),
							v.minLength(1, 'ticker symbol must be a non-empty string')
						)
					),
					tickerSymbolsArray
				);

				this.deltaUpdate = opts.delta;
				this.verboseMode = opts.verbose;

				await this.analyzeCandles();
			});
	}

	protected async analyzeCandles() {
		const candleAnalysisService = this.app
			.select(CandleUtilitiesModule)
			.get(CandleAnalysisService);

		const errors: string[] = [];

		if (this.verboseMode) {
			candleAnalysisService.progressEmitter.on(
				'analysis:debug',
				({ tickerSymbolName = '', periodType = '', message }) =>
					console.log(`[${tickerSymbolName} | ${periodType}] ${message}`)
			);
		} else {
			const progressBar = new CLIProgress.SingleBar({
				format: ' {bar} | {percentage}% | {value}/{total} | {tickerSymbol}',
				barCompleteChar: '\u2588',
				barIncompleteChar: '\u2591',
				hideCursor: true
			});

			candleAnalysisService.progressEmitter.on('analysis:start', ({ totalCount }) => {
				progressBar.start(totalCount, 0, { tickerSymbol: '' });
			});

			candleAnalysisService.progressEmitter.on('analysis:end', () => {
				progressBar.stop();
			});

			candleAnalysisService.progressEmitter.on(
				'analysis:process-ticker-symbol',
				({ tickerSymbolName, currentIndex }) => {
					progressBar.update(currentIndex, {
						tickerSymbolName
					});
				}
			);
		}

		candleAnalysisService.progressEmitter.on(
			'analysis:error',
			({ message, tickerSymbolName, periodType }) => {
				errors.push(`${tickerSymbolName} (${periodType}): ${message}`);
			}
		);

		await candleAnalysisService.analyzeCandlesForTickerSymbols(this.tickerSymbols, {
			periodTypes: [ECandlePeriodType.D, ECandlePeriodType.W],
			resetIndicatorsAndAlerts: !this.deltaUpdate,
			deltaUpdate: this.deltaUpdate
		});

		errors.forEach((error) => console.log(error));
	}
}

export default AnalyzeCandlesTask;
