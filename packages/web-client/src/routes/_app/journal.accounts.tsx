import {
	ITradeAccountsRouteData,
	loadTradeAccountsRouteData
} from '@src/route-loaders/trade-accounts';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/journal/accounts')({
	loader: async (): Promise<ITradeAccountsRouteData> => {
		const data = await loadTradeAccountsRouteData();

		return data;
	}
});
