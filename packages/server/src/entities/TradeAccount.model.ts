import { ETradeInstrumentType } from '@trading-assistant/common';
import { DbTradeAccount } from 'src/db/types/tables/tradeAccounts';

export class TradeAccount {
	public id: number;
	public userId: number;
	public label: string;
	public supportedInstruments: ETradeInstrumentType[];

	constructor(params: Partial<TradeAccount> = {}) {
		this.id = params.id ?? 0;
		this.userId = params.userId ?? 0;
		this.label = params.label ?? '';
		this.supportedInstruments = params.supportedInstruments ?? [];
	}

	static fromDbRecord(data: DbTradeAccount): TradeAccount {
		return new TradeAccount({
			id: data.id,
			userId: data.user_id,
			label: data.label,
			supportedInstruments: data.supported_instruments
		});
	}
}
