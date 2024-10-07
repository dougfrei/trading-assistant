import { Button, Divider, Group, Modal, Text } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import useDeleteTrade from '@src/hooks/useDeleteTrade';
import { IGqlTrade } from '@src/interfaces/IGqlResponses';
import { useCallback, useEffect } from 'react';

const DeleteTradeModal: React.FC<{
	tradeRecord: IGqlTrade | null;
	onClose: () => void;
	onDeleted: (tradeId: number) => void;
}> = ({ tradeRecord, onClose, onDeleted }) => {
	const { deleteTrade, isDeletingTrade, deleteTradeError, resetDeleteTradeStatus } =
		useDeleteTrade((deletedTradeId) => onDeleted(deletedTradeId));

	// reset the mutation status whenever the tradeRecord is changed
	useEffect(() => {
		resetDeleteTradeStatus();
	}, [tradeRecord]);

	const handleDeleteTrade = useCallback(() => {
		if (!tradeRecord) {
			return;
		}

		deleteTrade(tradeRecord.id);
	}, [tradeRecord]);

	return (
		<Modal
			opened={tradeRecord !== null}
			onClose={onClose}
			title="Confirm Deletion"
			centered
			closeOnClickOutside={!isDeletingTrade}
			closeOnEscape={!isDeletingTrade}
			withCloseButton={!isDeletingTrade}
		>
			<Text>
				Are you sure you want to delete this{' '}
				<strong>{tradeRecord?.tickerSymbol ?? ''}</strong> trade? This action cannot be
				undone.
			</Text>
			{deleteTradeError !== null && deleteTradeError.message.trim().length > 0 && (
				<AlertMessage type="error" mt="sm">
					{deleteTradeError.message.trim()}
				</AlertMessage>
			)}
			<Divider mt="sm" />
			<Group justify="space-between" mt="md">
				<Button variant="default" onClick={onClose} disabled={isDeletingTrade}>
					Cancel
				</Button>
				<Button color="red" onClick={handleDeleteTrade} loading={isDeletingTrade}>
					{isDeletingTrade ? 'Deleting' : 'Delete'}
				</Button>
			</Group>
		</Modal>
	);
};

export default DeleteTradeModal;
