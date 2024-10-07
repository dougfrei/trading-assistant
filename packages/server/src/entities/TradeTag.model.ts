import { ETradeTagType } from '@trading-assistant/common';
import { DbTradeTag } from 'src/db/types/tables/tradeTags';

export class TradeTag {
	public id: number;
	public userId: number;
	public type: ETradeTagType;
	public label: string;

	constructor(params: Partial<TradeTag> = {}) {
		this.id = params.id ?? 0;
		this.userId = params.userId ?? 0;
		this.type = params.type ?? ETradeTagType.SETUP;
		this.label = params.label ?? '';
	}

	static fromDbRecord(data: DbTradeTag): TradeTag {
		return new TradeTag({
			id: data.id,
			userId: data.user_id,
			type: data.type,
			label: data.label
		});
	}
}
