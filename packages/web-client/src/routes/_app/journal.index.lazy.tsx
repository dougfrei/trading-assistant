import { Loader } from '@mantine/core';
import TradesList from '@src/components/journal/trades-list/TradesList';
import AlertMessage from '@src/components/ui/AlertMessage';
import { TradesListContextProvider } from '@src/context/TradesListContext';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/journal/')({
	component: () => (
		<TradesListContextProvider>
			<TradesList />
		</TradesListContextProvider>
	),
	pendingComponent: () => <Loader />,
	errorComponent: ({ error }) => {
		return (
			<AlertMessage type="error">
				{error.message ?? 'An error occurred while loading the the trades list data'}
			</AlertMessage>
		);
	}
});
