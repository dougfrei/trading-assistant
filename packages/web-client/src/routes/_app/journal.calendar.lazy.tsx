import { Loader } from '@mantine/core';
import TradeMetricsCalendar from '@src/components/journal/trades-calendar/TradeMetricsCalendar';
import AlertMessage from '@src/components/ui/AlertMessage';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/journal/calendar')({
	component: TradeMetricsCalendar,
	pendingComponent: () => <Loader />,
	errorComponent: ({ error }) => {
		return (
			<AlertMessage type="error">
				{error.message ?? 'An error occurred while loading the trade calendar data'}
			</AlertMessage>
		);
	}
});
