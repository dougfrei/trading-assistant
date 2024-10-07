import { IGqlTickerSymbolNews } from '@src/interfaces/IGqlResponses';
import { loadDashboardRouteData } from '@src/route-loaders/dashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/')({
	loader: async (): Promise<IGqlTickerSymbolNews[]> => {
		const data = await loadDashboardRouteData();

		return data;
	}
});
