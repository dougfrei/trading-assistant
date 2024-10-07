import { Box, Loader } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import CreateTradeForm from '@src/components/journal/create-trade-form/CreateTradeForm';
import AlertMessage from '@src/components/ui/AlertMessage';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';

const JournalAddView: React.FC = () => {
	const navigate = useNavigate();

	return (
		<Box mb="xl">
			<CreateTradeForm
				onTradeCreated={() => {
					showNotification({
						message: 'Trade created successfully'
					});
					navigate({ to: '/journal' });
				}}
			/>
		</Box>
	);
};

export const Route = createLazyFileRoute('/_app/journal/add')({
	component: JournalAddView,
	pendingComponent: () => <Loader />,
	errorComponent: ({ error }) => {
		return (
			<AlertMessage type="error">
				{error.message ?? 'An error occurred while loading the the trade accounts'}
			</AlertMessage>
		);
	}
});
