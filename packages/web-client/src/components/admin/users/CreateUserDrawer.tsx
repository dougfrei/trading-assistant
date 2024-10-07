import { Drawer, Loader } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import useCreateUser from '@src/hooks/useCreateUser';
import useUserRoleTypes from '@src/hooks/useUserRoleTypes';
import { IGqlUser } from '@src/interfaces/IGqlResponses';
import UserForm, { IUserFormSubmitValues } from './UserForm';

const CreateUserDrawer: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	onUserCreated: (newUser: IGqlUser) => void;
}> = ({ isOpen, onClose, onUserCreated }) => {
	const { userRoleTypes, userRoleTypesError, isLoadingUserRoleTypes } = useUserRoleTypes();
	const { createUser, createUserError, isCreatingUser, resetCreateUserStatus } = useCreateUser(
		(createdUser) => {
			resetCreateUserStatus();
			onUserCreated(createdUser);
		}
	);

	const handleSubmit = (values: IUserFormSubmitValues) => {
		createUser({
			username: values.username,
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
	} else if (userRoleTypes) {
		renderContent = (
			<UserForm
				mode="create"
				submitButtonText="Create User"
				userRoleTypes={userRoleTypes}
				onSubmit={handleSubmit}
				onCancel={onClose}
				errorMessage={createUserError ? createUserError.message : ''}
				disabled={isCreatingUser}
			/>
		);
	}

	return (
		<Drawer
			opened={isOpen}
			onClose={() => {
				resetCreateUserStatus();
				onClose();
			}}
			title="Create User"
			padding="lg"
			size="lg"
			position="right"
			closeOnClickOutside={!isCreatingUser}
			closeOnEscape={!isCreatingUser}
			withCloseButton={!isCreatingUser}
		>
			{renderContent}
		</Drawer>
	);
};

export default CreateUserDrawer;
