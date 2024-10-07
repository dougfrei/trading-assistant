import { Button, Card, Divider, Loader, PasswordInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import FormControlsDisabledContainer from '@src/components/controls/FormControlsDisabledContainer';
import AlertMessage from '@src/components/ui/AlertMessage';
import {
	DEFAULT_ACCOUNT_ACTIVATE_ERROR_MESSAGE,
	DEFAULT_VALIDATE_ACCOUNT_ACTIVATE_ID_ERROR_MESSAGE
} from '@src/constants';
import { activateAccount, validateAccountActivateId } from '@src/util/auth';
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
		password: passwordSchema(),
		confirmPassword: passwordSchema(
			'Password confirmation is required',
			'Password confirmation'
		)
	}),
	v.check(
		(values) => values.password === values.confirmPassword,
		'The "Password" and "Confirm Password" fields do not match.'
	)
);

type TLoginFormValues = v.InferInput<typeof formSchema>;

const ActivateAccount: React.FC = () => {
	const { activateId } = Route.useParams();
	const [errorMessage, setErrorMessage] = useState('');
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			password: '',
			confirmPassword: ''
		},
		validate: valibotResolver(formSchema)
	});

	// TODO: this would be better suited in the route data loader
	const validateActivateIdQuery = useQuery({
		queryKey: ['activate-id-validation', activateId],
		queryFn: () => validateAccountActivateId(activateId)
	});

	const activateAccountMutation = useMutation({
		mutationFn: (values: { activateId: string; password: string }) =>
			activateAccount(values.activateId, values.password),
		onError: (error: unknown) =>
			setErrorMessage(getErrorObjectMessage(error, DEFAULT_ACCOUNT_ACTIVATE_ERROR_MESSAGE))
	});

	const handleResetRequest = async (values: TLoginFormValues) => {
		const validateResult = v.safeParse(formSchema, values);

		if (!validateResult.success) {
			setErrorMessage(validateResult.issues.map((issue) => issue.message).join('; '));
			return;
		}

		setErrorMessage('');

		activateAccountMutation.mutate({
			activateId,
			password: validateResult.output.password
		});
	};

	if (validateActivateIdQuery.isLoading) {
		return (
			<Stack align="center">
				<Loader />
				<span>Validating account activation link...</span>
			</Stack>
		);
	}

	if (validateActivateIdQuery.isError) {
		return (
			<Stack align="center">
				<AlertMessage type="error">
					{getErrorObjectMessage(
						validateActivateIdQuery.error,
						DEFAULT_VALIDATE_ACCOUNT_ACTIVATE_ID_ERROR_MESSAGE
					)}
				</AlertMessage>
			</Stack>
		);
	}

	return (
		<>
			{errorMessage.length > 0 && (
				<AlertMessage type="error" mb="sm">
					{errorMessage}
				</AlertMessage>
			)}
			<Card shadow="sm" padding="lg" radius="md" withBorder>
				{activateAccountMutation.isSuccess ? (
					<>
						<p>
							Your account has been activated. You may now login with your specified
							credentials.
						</p>
						<p>
							<Link to="/login">Go to the login page</Link>
						</p>
					</>
				) : (
					<form
						onSubmit={form.onSubmit(handleResetRequest)}
						aria-disabled={activateAccountMutation.isPending}
					>
						<FormControlsDisabledContainer disabled={activateAccountMutation.isPending}>
							<Stack gap="sm">
								<PasswordInput
									label="Password"
									withAsterisk
									autoFocus
									key={form.key('password')}
									{...form.getInputProps('password')}
								/>
								<PasswordInput
									label="Confirm Password"
									withAsterisk
									key={form.key('confirmPassword')}
									{...form.getInputProps('confirmPassword')}
								/>
							</Stack>
							<Divider my="lg" />
							<Button
								type="submit"
								fullWidth
								loading={activateAccountMutation.isPending}
							>
								Activate Account
							</Button>
						</FormControlsDisabledContainer>
					</form>
				)}
			</Card>
		</>
	);
};

export const Route = createFileRoute('/_auth/activate-account/$activateId')({
	component: () => <ActivateAccount />
});
