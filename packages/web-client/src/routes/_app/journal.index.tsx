import { ITradesListRouteData, loadTradesListRouteData } from '@src/route-loaders/trades-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/journal/')({
	loader: async (): Promise<ITradesListRouteData> => {
		const data = await loadTradesListRouteData();

		return data;
	}
});
