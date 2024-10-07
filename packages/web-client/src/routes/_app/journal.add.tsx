import { ICreateTradeRouteData, loadCreateTradeRouteData } from '@src/route-loaders/create-trade';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/journal/add')({
	loader: async (): Promise<ICreateTradeRouteData> => {
		const data = await loadCreateTradeRouteData();

		return data;
	}
});
