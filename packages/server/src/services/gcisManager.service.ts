import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import ESectorsSortMethod from 'src/enums/ESectorsSortMethod';

export interface IGCISRecord {
	gcis: string;
	name: string;
}

@Injectable()
export class GCISManagerService {
	protected records: Record<string, string> = {};

	/**
	 * GCISManagerService constructor
	 *
	 * GCIS mappings will be read from data/gcis.json or the file specified in
	 * the GCIS_JSON_FILENAME environment variable if it has been set.
	 */
	constructor() {
		const gcisJsonFilename =
			process.env.GCIS_JSON_FILENAME ?? `${process.cwd()}/data/gcis.json`;

		const data = readFileSync(gcisJsonFilename, { encoding: 'utf-8' });

		this.records = JSON.parse(data);
	}

	/**
	 * Return all available GCIS sector records
	 *
	 * @param order The ordering method
	 * @returns Array of IGCISRecord objects
	 */
	getAllSectors(order: ESectorsSortMethod = ESectorsSortMethod.NAME_ASC): IGCISRecord[] {
		const sectorKeys = Object.keys(this.records).filter((key) => key.length === 2);

		const sectors = sectorKeys.map((key) => ({
			gcis: key,
			name: this.records[key]
		}));

		const sortFunc =
			(sortBy: 'gcis' | 'name', sortDir: 'asc' | 'desc') =>
			(a: IGCISRecord, b: IGCISRecord) => {
				if (a[sortBy] === b[sortBy]) {
					return 0;
				}

				return a[sortBy] < b[sortBy]
					? sortDir === 'asc'
						? -1
						: 1
					: sortDir === 'asc'
						? 1
						: -1;
			};

		switch (order) {
			case ESectorsSortMethod.GCIS_ASC:
				sectors.sort(sortFunc('gcis', 'asc'));
				break;

			case ESectorsSortMethod.GCIS_DESC:
				sectors.sort(sortFunc('gcis', 'desc'));
				break;

			case ESectorsSortMethod.NAME_DESC:
				sectors.sort(sortFunc('name', 'desc'));
				break;

			case ESectorsSortMethod.NAME_ASC:
			default:
				sectors.sort(sortFunc('name', 'asc'));
				break;
		}

		return sectors;
	}

	/**
	 * Return the matching sector for the provided GCIS value. This method will
	 * only match top-level sectors based on the first two characters of the
	 * GCIS value.
	 *
	 * @param gcis The GCIS string value
	 * @returns An IGCISRecord object or null if no matching sector is found
	 */
	getSector(gcis: string): IGCISRecord | null {
		if (gcis.length < 2) {
			return null;
		}

		const sectorGCIS = gcis.slice(0, 2);

		return this.records[sectorGCIS]
			? { gcis: sectorGCIS, name: this.records[sectorGCIS] }
			: null;
	}
}
