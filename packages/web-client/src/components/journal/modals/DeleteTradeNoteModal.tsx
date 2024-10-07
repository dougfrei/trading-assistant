import { Button, Divider, Group, Modal, Text } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import { useTradesListContext } from '@src/hooks/useTradesListContext';
import useUpdateTrade from '@src/hooks/useUpdateTrade';
import { useCallback, useEffect } from 'react';

const DeleteTradeNoteModal: React.FC<{
	onClose: () => void;
	onDeleted: (tradeId: number, tradeNoteId: string) => void;
}> = ({ onClose, onDeleted }) => {
	const { deleteTradeNoteState } = useTradesListContext();
	const { updateTrade, isUpdatingTrade, updateTradeError, resetUpdateTradeStatus } =
		useUpdateTrade((updatedTrade) => {
			onDeleted(updatedTrade.id, deleteTradeNoteState?.tradeNote.id ?? '');
		});

	// reset the mutation status whenever the deleteTradeNoteState is changed
	useEffect(() => {
		resetUpdateTradeStatus();
	}, [deleteTradeNoteState, resetUpdateTradeStatus]);

	const handleDeleteTrade = useCallback(() => {
		if (!deleteTradeNoteState) {
			return;
		}

		updateTrade(deleteTradeNoteState.tradeRecord.id, {
			notes: deleteTradeNoteState.tradeRecord.notes.filter(
				(note) => note.id !== deleteTradeNoteState.tradeNote.id
			)
		});
	}, [deleteTradeNoteState, updateTrade]);

	return (
		<Modal
			opened={deleteTradeNoteState !== null}
			onClose={onClose}
			title="Confirm Deletion"
			centered
			closeOnClickOutside={!isUpdatingTrade}
			closeOnEscape={!isUpdatingTrade}
			withCloseButton={!isUpdatingTrade}
		>
			<Text>
				Are you sure you want to delete this trade note? This action cannot be undone.
			</Text>
			{updateTradeError !== null && updateTradeError.message.trim().length > 0 && (
				<AlertMessage type="error" mt="sm">
					{updateTradeError.message.trim()}
				</AlertMessage>
			)}
			<Divider mt="sm" />
			<Group justify="space-between" mt="md">
				<Button variant="default" onClick={onClose} disabled={isUpdatingTrade}>
					Cancel
				</Button>
				<Button color="red" onClick={handleDeleteTrade} loading={isUpdatingTrade}>
					{isUpdatingTrade ? 'Deleting' : 'Delete'}
				</Button>
			</Group>
		</Modal>
	);
};

export default DeleteTradeNoteModal;
