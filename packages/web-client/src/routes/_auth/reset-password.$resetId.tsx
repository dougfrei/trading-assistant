import { Button, Card, Divider, Loader, PasswordInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import FormControlsDisabledContainer from '@src/components/controls/FormControlsDisabledContainer';
import AlertMessage from '@src/components/ui/AlertMessage';
import { resetPassword, validatePasswordResetId } from '@src/util/auth';
import { getErrorObjectMessage } from '@src/util/errors';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { passwordSchema } from '@trading-assistant/common/schemas';
import { valibotResolver } from 'mantine-form-valibot-resolver';
import { useState } from 'react';
import * as v from 'valibot';

const formSchema = v.pipe(
	v.object({
		password: passwordSchema('New password is required', 'New password'),
		confirmPassword: passwordSchema(
			'Please confirm your new password',
			'New password confirmation'
		)
	}),
	v.check(
		(values) => values.password === values.confirmPassword,
		'The "Password" and "New Password" fields do not match.'
	)
);

type TFormValues = v.InferInput<typeof formSchema>;

const ResetPassword: React.FC = () => {
	const { resetId } = Route.useParams();
	const [errorMessage, setErrorMessage] = useState('');
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			password: '',
			confirmPassword: ''
		},
		validate: valibotResolver(formSchema)
	});

	const validateResetIdQuery = useQuery({
		queryKey: ['reset-password-validation', resetId],
		queryFn: () => validatePasswordResetId(resetId)
	});

	const resetPasswordMutation = useMutation({
		mutationFn: (values: { resetId: string; newPassword: string }) =>
			resetPassword(values.resetId, values.newPassword),
		onError: (error: unknown) =>
			setErrorMessage(
				getErrorObjectMessage(
					error,
					'An error occurred while processing your password reset request. Please try again.'
				)
			)
	});

	const handleResetRequest = async (values: TFormValues) => {
		const validateResult = v.safeParse(formSchema, values);

		if (!validateResult.success) {
			setErrorMessage(validateResult.issues.map((issue) => issue.message).join('; '));
			return;
		}

		setErrorMessage('');

		resetPasswordMutation.mutate({ resetId, newPassword: validateResult.output.password });
	};

	if (validateResetIdQuery.isLoading) {
		return (
			<Stack align="center">
				<Loader />
				<span>Validating password reset request link...</span>
			</Stack>
		);
	}

	if (validateResetIdQuery.isError) {
		return (
			<Stack align="center">
				<AlertMessage type="error">
					{getErrorObjectMessage(
						validateResetIdQuery.error,
						'An error occurred while validating the reset link. It may be invalid or expired.'
					)}
				</AlertMessage>
			</Stack>
		);
	}

	return (
		<>
			{errorMessage.length > 0 && <AlertMessage type="error">{errorMessage}</AlertMessage>}
			<Card shadow="sm" padding="lg" radius="md" withBorder>
				{resetPasswordMutation.isSuccess ? (
					<>
						<p>
							Your password has been reset. You may now login with your new
							credentials.
						</p>
						<p>
							<Link to="/login">Return to the login page</Link>
						</p>
					</>
				) : (
					<form
						onSubmit={form.onSubmit(handleResetRequest)}
						aria-disabled={resetPasswordMutation.isPending}
					>
						<FormControlsDisabledContainer disabled={resetPasswordMutation.isPending}>
							<Stack gap="sm">
								<PasswordInput
									label="New Password"
									withAsterisk
									autoFocus
									key={form.key('password')}
									{...form.getInputProps('password')}
								/>
								<PasswordInput
									label="Confirm New Password"
									withAsterisk
									key={form.key('confirmPassword')}
									{...form.getInputProps('confirmPassword')}
								/>
							</Stack>
							<Divider my="lg" />
							<Button
								type="submit"
								fullWidth
								loading={resetPasswordMutation.isPending}
							>
								Reset Password
							</Button>
						</FormControlsDisabledContainer>
					</form>
				)}
			</Card>
		</>
	);
};

export const Route = createFileRoute('/_auth/reset-password/$resetId')({
	component: ResetPassword
});
