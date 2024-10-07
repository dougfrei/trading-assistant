import { Button, Divider, Group, Modal, Text } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import useDeleteTradeAccount from '@src/hooks/useDeleteTradeAccount';
import { IGqlTradeAccount } from '@src/interfaces/IGqlResponses';

const DeleteTradeAccountModal: React.FC<{
	tradeAccount: IGqlTradeAccount | null;
	onCancel: () => void;
	onDeleted: (deletedAccount: IGqlTradeAccount) => void;
}> = ({ tradeAccount, onCancel, onDeleted }) => {
	const {
		deleteTradeAccount,
		isDeletingTradeAccount,
		deleteTradeAccountError,
		resetDeleteTradeAccountMutation
	} = useDeleteTradeAccount((deletedTradeAccount) => {
		resetDeleteTradeAccountMutation();
		onDeleted(deletedTradeAccount);
	});

	return (
		<Modal
			opened={tradeAccount !== null}
			onClose={onCancel}
			title="Delete Trade Account"
			centered
			closeOnClickOutside={!isDeletingTradeAccount}
			closeOnEscape={!isDeletingTradeAccount}
			withCloseButton={!isDeletingTradeAccount}
		>
			{tradeAccount && (
				<>
					<Text>
						Are you sure you want to delete the trade account{' '}
						<strong>{tradeAccount.label ?? ''}</strong>? All trades associated with this
						account will also be deleted.
					</Text>
					{deleteTradeAccountError !== null && (
						<AlertMessage type="error" mt="sm">
							{deleteTradeAccountError.message.trim() ??
								'An error occurred while deleting the trade account'}
						</AlertMessage>
					)}
					<Divider mt="sm" />
					<Group justify="space-between" mt="md">
						<Button
							variant="default"
							onClick={onCancel}
							disabled={isDeletingTradeAccount}
						>
							Cancel
						</Button>
						<Button
							color="red"
							onClick={() => deleteTradeAccount(tradeAccount.id)}
							loading={isDeletingTradeAccount}
						>
							{isDeletingTradeAccount ? 'Deleting' : 'Delete'}
						</Button>
					</Group>
				</>
			)}
		</Modal>
	);
};

export default DeleteTradeAccountModal;
