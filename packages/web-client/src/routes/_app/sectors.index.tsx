import { IGqlSector } from '@src/interfaces/IGqlResponses';
import { loadSectorsRouteData } from '@src/route-loaders/sectors';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/sectors/')({
	loader: async (): Promise<IGqlSector[]> => {
		const data = await loadSectorsRouteData();

		return data;
	}
});
