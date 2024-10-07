import { Button, Divider, PasswordInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlUser } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { passwordSchema } from '@trading-assistant/common/schemas';
import { gql } from 'graphql-request';
import { valibotResolver } from 'mantine-form-valibot-resolver';
import { useState } from 'react';
import * as v from 'valibot';
import FormControlsDisabledContainer from '../controls/FormControlsDisabledContainer';
import AlertMessage from '../ui/AlertMessage';

const CHANGE_USER_PASSWORD_MUTATION = gql`
	mutation ChangeUserPassword($currentPassword: String!, $newPassword: String!) {
		changeUserPassword(currentPassword: $currentPassword, newPassword: $newPassword) {
			id
			displayName
		}
	}
`;

const formSchema = v.pipe(
	v.object({
		currentPassword: v.pipe(v.string(), v.trim(), v.minLength(1, 'This field cannot be empty')),
		newPassword: passwordSchema('New password is required', 'New password'),
		confirmNewPassword: passwordSchema(
			'New password confirmation is required',
			'New password confirmation'
		)
	}),
	v.check(
		(values) => values.newPassword === values.confirmNewPassword,
		'The "New Password" and "Confirm New Password" fields do not match.'
	)
);

type TFormValues = v.InferInput<typeof formSchema>;

const AccountChangePassword: React.FC = () => {
	const [errorMessage, setErrorMessage] = useState('');
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: ''
		},
		validate: valibotResolver(formSchema)
	});
	const { mutate, isPending } = useMutation({
		mutationFn: async ({
			currentPassword,
			newPassword
		}: {
			currentPassword: string;
			newPassword: string;
		}) => {
			const response = await executeGQLRequest<{ changeUserPassword: IGqlUser }>(
				CHANGE_USER_PASSWORD_MUTATION,
				{
					currentPassword,
					newPassword
				}
			);

			return response.changeUserPassword;
		},
		onSuccess: () => {
			form.setFieldValue('currentPassword', '');
			form.setFieldValue('newPassword', '');
			form.setFieldValue('confirmNewPassword', '');

			showNotification({
				color: 'green',
				title: 'Success',
				message: 'Your password has been changed',
				withBorder: true,
				position: 'bottom-center'
			});
		},
		onError: (error) => {
			setErrorMessage(error.message ?? 'An error occurred while changing your password');
		}
	});

	const handleSubmit = (values: TFormValues) => {
		const validateResult = v.safeParse(formSchema, values);

		if (!validateResult.success) {
			setErrorMessage(validateResult.issues.map((issue) => issue.message).join('; '));
			return;
		}

		setErrorMessage('');

		mutate({
			currentPassword: validateResult.output.currentPassword,
			newPassword: validateResult.output.newPassword
		});
	};

	const handleError = (errors: typeof form.errors) => {
		// focus on the field with the first error
		form.getInputNode(Object.keys(errors)[0])?.focus();
	};

	return (
		<Stack>
			{errorMessage.trim().length > 0 && (
				<AlertMessage type="error">{errorMessage}</AlertMessage>
			)}
			<form onSubmit={form.onSubmit(handleSubmit, handleError)} aria-disabled={isPending}>
				<FormControlsDisabledContainer disabled={isPending}>
					<Stack gap="sm">
						<PasswordInput
							label="Current Password"
							withAsterisk
							autoFocus
							key={form.key('currentPassword')}
							{...form.getInputProps('currentPassword')}
						/>
						<PasswordInput
							label="New Password"
							withAsterisk
							key={form.key('newPassword')}
							{...form.getInputProps('newPassword')}
						/>
						<PasswordInput
							label="Confirm New Password"
							withAsterisk
							key={form.key('confirmNewPassword')}
							{...form.getInputProps('confirmNewPassword')}
						/>
					</Stack>
					<Divider my="lg" />
					<Button type="submit" loading={isPending}>
						Change Password
					</Button>
				</FormControlsDisabledContainer>
			</form>
		</Stack>
	);
};

export default AccountChangePassword;
