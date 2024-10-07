import { Drawer, Loader } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import useUpdateUser from '@src/hooks/useUpdateUser';
import useUserRoleTypes from '@src/hooks/useUserRoleTypes';
import { IGqlUser } from '@src/interfaces/IGqlResponses';
import UserForm, { IUserFormSubmitValues } from './UserForm';

const EditUserDrawer: React.FC<{
	user: IGqlUser | null;
	onClose: () => void;
	onUserUpdated: (updatedUser: IGqlUser) => void;
}> = ({ user, onClose, onUserUpdated }) => {
	const { userRoleTypes, userRoleTypesError, isLoadingUserRoleTypes } = useUserRoleTypes();
	const { updateUser, updateUserError, isUpdatingUser, resetUpdateUser } = useUpdateUser(
		(updatedUser) => {
			resetUpdateUser();
			onUserUpdated(updatedUser);
		}
	);

	const handleSubmit = (values: IUserFormSubmitValues) => {
		if (!user) {
			return;
		}

		updateUser(user.id, {
			displayName: values.displayName,
			roles: values.roles
		});
	};

	let renderContent = null;

	if (isLoadingUserRoleTypes) {
		renderContent = <Loader />;
	} else if (userRoleTypesError) {
		renderContent = (
			<AlertMessage type="error">
				{userRoleTypesError.message ??
					'An error occurred while loading the user role types'}
			</AlertMessage>
		);
	} else if (user && userRoleTypes) {
		renderContent = (
			<UserForm
				mode="edit"
				submitButtonText="Update User"
				userRoleTypes={userRoleTypes}
				onSubmit={handleSubmit}
				onCancel={onClose}
				errorMessage={updateUserError ? updateUserError.message : ''}
				disabled={isUpdatingUser}
				user={user}
			/>
		);
	}

	return (
		<Drawer
			opened={user !== null}
			onClose={() => {
				resetUpdateUser();
				onClose();
			}}
			title="Edit User"
			padding="lg"
			size="lg"
			position="right"
			closeOnClickOutside={!isUpdatingUser}
			closeOnEscape={!isUpdatingUser}
			withCloseButton={!isUpdatingUser}
		>
			{renderContent}
		</Drawer>
	);
};

export default EditUserDrawer;
