import { readFileSync } from 'node:fs';
import { IFMPStockScreenerItem } from 'src/data-sources/FMPClient.interfaces';
import { IFMPCloudStockScreenerItem } from 'src/data-sources/FMPCloudClient.interfaces';

type TFMPGCIStemplate = Record<
	string,
	{
		sectorGCIS: string;
		fullGCIS: Record<string, string>;
	}
>;

class FMPGCISManager {
	protected template: TFMPGCIStemplate = {};
	protected sectors = new Map<string, string>();
	protected industries = new Map<string, string>();

	// TODO: this should be a service and utilize the AppGlobals service for the root path
	constructor(jsonFilename = `${process.cwd()}/data/fmp-gcis-mappings.json`) {
		const data = readFileSync(jsonFilename, { encoding: 'utf-8' });

		this.template = JSON.parse(data);

		for (const sector in this.template) {
			this.sectors.set(sector.toLowerCase(), this.template[sector].sectorGCIS);

			for (const industry in this.template[sector].fullGCIS) {
				this.industries.set(
					`${this.template[sector].sectorGCIS}:${industry.toLowerCase()}`,
					this.template[sector].fullGCIS[industry]
				);
			}
		}
	}

	getGCIS(sector: string, industry = ''): string {
		const sectorGCIS = this.sectors.get(sector.toLowerCase());

		if (!sectorGCIS) {
			return '';
		}

		const industryGCIS = this.industries.get(`${sectorGCIS}:${industry.toLowerCase()}`);

		return industryGCIS ?? sectorGCIS;
	}

	static createEmptyTemplate(
		screenerItems: IFMPStockScreenerItem[] | IFMPCloudStockScreenerItem[]
	): TFMPGCIStemplate {
		const validRecords = screenerItems.filter(
			(record) => typeof record.sector === 'string' && record.sector.trim()
		);

		const sectors = new Map<string, Set<string>>();

		validRecords.forEach((record) => {
			if (
				typeof record.industry !== 'string' ||
				!record.industry.trim() ||
				record.industry.trim().toLowerCase() === 'n/a' ||
				!record.sector?.trim()
			) {
				return;
			}

			sectors.set(
				record.sector.trim(),
				new Set([
					...Array.from(sectors.get(record.sector.trim())?.values() ?? []),
					record.industry.trim()
				])
			);
		});

		const template = Array.from(sectors.keys()).reduce<TFMPGCIStemplate>((acum, sectorKey) => {
			acum[sectorKey] = {
				sectorGCIS: '',
				fullGCIS: {}
			};

			Array.from(sectors.get(sectorKey) ?? []).forEach((industry) => {
				acum[sectorKey].fullGCIS[industry] = '';
			});

			return acum;
		}, {});

		return template;
	}
}

export default FMPGCISManager;
