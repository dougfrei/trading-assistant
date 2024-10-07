import { Button, Divider, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useAuth } from '@src/hooks/useAuth';
import useUpdateUser from '@src/hooks/useUpdateUser';
import { valibotResolver } from 'mantine-form-valibot-resolver';
import * as v from 'valibot';
import FormControlsDisabledContainer from '../controls/FormControlsDisabledContainer';
import AlertMessage from '../ui/AlertMessage';

const formSchema = v.object({
	displayName: v.pipe(v.string(), v.trim(), v.minLength(1, 'This field cannot be empty'))
});

type TFormValues = v.InferInput<typeof formSchema>;

const AccountProfile: React.FC = () => {
	const auth = useAuth();
	const { updateCurrentUser, updateUserError, isUpdatingUser } = useUpdateUser((updatedUser) => {
		auth.updateUser({ displayName: updatedUser.displayName });

		showNotification({
			color: 'green',
			title: 'Success',
			message: 'Your profile changes have been saved',
			withBorder: true,
			position: 'bottom-center'
		});
	});
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			displayName: auth.user?.displayName ?? ''
		},
		validate: valibotResolver(formSchema)
	});

	const handleSubmit = (values: TFormValues) => {
		updateCurrentUser({ displayName: values.displayName.trim() });
	};

	return (
		<Stack>
			{updateUserError !== null && (
				<AlertMessage type="error">
					{updateUserError.message ?? 'An error occurred while updating your profile'}
				</AlertMessage>
			)}
			<form onSubmit={form.onSubmit(handleSubmit)} aria-disabled={isUpdatingUser}>
				<FormControlsDisabledContainer disabled={isUpdatingUser}>
					<TextInput
						label="Display Name"
						withAsterisk
						autoFocus
						key={form.key('displayName')}
						{...form.getInputProps('displayName')}
					/>
					<Divider my="lg" />
					<Button type="submit" loading={isUpdatingUser}>
						Update Profile
					</Button>
				</FormControlsDisabledContainer>
			</form>
		</Stack>
	);
};

export default AccountProfile;
