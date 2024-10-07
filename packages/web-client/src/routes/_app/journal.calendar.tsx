import {
	ITradeCalendarRouteData,
	loadTradeCalendarRouteData
} from '@src/route-loaders/trade-calendar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/journal/calendar')({
	loader: async (): Promise<ITradeCalendarRouteData> => {
		const data = await loadTradeCalendarRouteData();

		return data;
	}
});
