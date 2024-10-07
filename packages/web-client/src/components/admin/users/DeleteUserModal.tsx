import { Button, Divider, Group, Modal, Text } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import useDeleteUser from '@src/hooks/useDeleteUser';
import { IGqlUser } from '@src/interfaces/IGqlResponses';

const DeleteUserModal: React.FC<{
	user: IGqlUser | null;
	onCancel: () => void;
	onDeleted: (deletedUser: IGqlUser) => void;
}> = ({ user, onCancel, onDeleted }) => {
	const { deleteUser, isDeletingUser, deleteUserError, resetDeleteUserMutation } = useDeleteUser(
		(deletedUser) => {
			resetDeleteUserMutation();
			onDeleted(deletedUser);
		}
	);

	return (
		<Modal
			opened={user !== null}
			onClose={onCancel}
			title="Delete User"
			centered
			closeOnClickOutside={!isDeletingUser}
			closeOnEscape={!isDeletingUser}
			withCloseButton={!isDeletingUser}
		>
			{user && (
				<>
					<Text>
						Are you sure you want to delete the user{' '}
						<strong>{user.username ?? ''}</strong>? All trades associated with this
						account will also be deleted.
					</Text>
					{deleteUserError !== null && (
						<AlertMessage type="error" mt="sm">
							{deleteUserError.message.trim() ??
								'An error occurred while deleting the user'}
						</AlertMessage>
					)}
					<Divider mt="sm" />
					<Group justify="space-between" mt="md">
						<Button variant="default" onClick={onCancel} disabled={isDeletingUser}>
							Cancel
						</Button>
						<Button
							color="red"
							onClick={() => deleteUser(user.id)}
							loading={isDeletingUser}
						>
							{isDeletingUser ? 'Deleting' : 'Delete'}
						</Button>
					</Group>
				</>
			)}
		</Modal>
	);
};

export default DeleteUserModal;
