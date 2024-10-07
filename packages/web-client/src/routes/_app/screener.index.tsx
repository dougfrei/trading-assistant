import { IScreenerRouteData, loadScreenerRouteData } from '@src/route-loaders/screener';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/screener/')({
	loader: async (): Promise<IScreenerRouteData> => {
		const data = await loadScreenerRouteData();

		return data;
	}
});
