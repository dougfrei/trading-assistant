import { Button, Divider, Group, Modal, Text } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import useDeleteTradeTag from '@src/hooks/useDeleteTradeTag';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { useCallback, useEffect } from 'react';

const DeleteTradeTagModal: React.FC<{
	tradeTagRecord: IGqlTradeTag | null;
	onClose: () => void;
	onDeleted: (tagId: number) => void;
}> = ({ tradeTagRecord, onClose, onDeleted }) => {
	const { deleteTradeTag, isDeletingTradeTag, deleteTradeTagError, resetDeleteTradeTagStatus } =
		useDeleteTradeTag((deletedTagId) => onDeleted(deletedTagId));

	// reset the mutation status whenever the tradeTagRecord is changed
	useEffect(() => {
		resetDeleteTradeTagStatus();
	}, [tradeTagRecord]);

	const handleDeleteTrade = useCallback(() => {
		if (!tradeTagRecord) {
			return;
		}

		deleteTradeTag(tradeTagRecord.id);
	}, [tradeTagRecord]);

	return (
		<Modal
			opened={tradeTagRecord !== null}
			onClose={onClose}
			title="Confirm Deletion"
			centered
			closeOnClickOutside={!isDeletingTradeTag}
			closeOnEscape={!isDeletingTradeTag}
			withCloseButton={!isDeletingTradeTag}
		>
			<Text>
				Are you sure you want to delete the tag{' '}
				<strong>{tradeTagRecord?.label ?? ''}</strong>? This action cannot be undone.
			</Text>
			{deleteTradeTagError !== null && deleteTradeTagError.message.trim().length > 0 && (
				<AlertMessage type="error" mt="sm">
					{deleteTradeTagError.message.trim()}
				</AlertMessage>
			)}
			<Divider mt="sm" />
			<Group justify="space-between" mt="md">
				<Button variant="default" onClick={onClose} disabled={isDeletingTradeTag}>
					Cancel
				</Button>
				<Button color="red" onClick={handleDeleteTrade} loading={isDeletingTradeTag}>
					{isDeletingTradeTag ? 'Deleting' : 'Delete'}
				</Button>
			</Group>
		</Modal>
	);
};

export default DeleteTradeTagModal;
