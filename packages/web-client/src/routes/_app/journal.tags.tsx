import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { loadTradeTagsRouteData } from '@src/route-loaders/trade-tags';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/journal/tags')({
	loader: async (): Promise<IGqlTradeTag[]> => {
		const data = await loadTradeTagsRouteData();

		return data;
	}
});
