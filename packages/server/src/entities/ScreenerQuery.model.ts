import { IScreenerQueryLogicRoot } from '@trading-assistant/common';
import { DbScreenerQuery } from 'src/db/types/tables/screenerQueries';
import { isScreenerQueryLogicRoot } from 'src/util/screenerQuery';

export class ScreenerQuery {
	public id: number;
	public label: string;
	public description: string;
	public query: IScreenerQueryLogicRoot | null;

	constructor(params: Partial<ScreenerQuery> = {}) {
		this.id = params.id ?? 0;
		this.label = params.label ?? '';
		this.description = params.description ?? '';
		this.query = params.query ?? null;
	}

	static fromDbRecord(data: DbScreenerQuery): ScreenerQuery {
		return new ScreenerQuery({
			id: data.id,
			label: data.label,
			description: data.description,
			query: isScreenerQueryLogicRoot(data.query) ? data.query : null
		});
	}
}
