import { Command } from 'commander';
import { parse } from 'node-html-parser';
import { readFile, writeFile } from 'node:fs/promises';
import CLITask from 'src/cli/cli-task';
import { valibotSchemas } from 'src/util/valibot';
import * as v from 'valibot';

class ParseWikipediaGCISTask extends CLITask {
	protected htmlFilename = '';
	protected outputJsonFilename = '';

	protected createCommanderTask(program: Command): void {
		program
			.command('parse-wikipedia-gcis')
			.description('Parse Wikipedia GCIS table data')
			.argument('<html-file>', 'The Wikipedia page HTML file')
			.argument('<output-json-file>', 'The output JSON file to create')
			.action(async (htmlFilename, outputJsonFilename) => {
				this.htmlFilename = v.parse(
					valibotSchemas.nonEmptyString('HTML filename must be a non-empty string'),
					htmlFilename
				);
				this.outputJsonFilename = v.parse(
					valibotSchemas.nonEmptyString(
						'JSON output filename must be a non-empty string'
					),
					outputJsonFilename
				);

				await this.parseWikipediaGCIS();
			});
	}

	protected async parseWikipediaGCIS() {
		const fileBuf = await readFile(this.htmlFilename);

		const root = parse(fileBuf.toString());
		const tableEl = root.querySelector('div#bodyContent table.wikitable');

		if (!tableEl) {
			throw new Error('Unable to find table element');
		}

		const tdEls = tableEl.querySelectorAll('td');
		const numericRegex = /^\d+$/;

		const gcisRecords: Record<string, string> = {};

		tdEls.forEach((tdEl) => {
			const gcis = tdEl.innerText.trim();

			if (gcis.length > 8 || gcis.length % 2 !== 0 || !numericRegex.test(gcis)) {
				return;
			}

			const label = tdEl.nextElementSibling?.innerText.trim() ?? '';

			gcisRecords[gcis] = label;
		});

		await writeFile(this.outputJsonFilename, JSON.stringify(gcisRecords));

		console.log(
			`${Object.keys(gcisRecords).length} records saved to ${this.outputJsonFilename}`
		);
	}
}

export default ParseWikipediaGCISTask;
