import { Button, Card, Divider, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import FormControlsDisabledContainer from '@src/components/controls/FormControlsDisabledContainer';
import AlertMessage from '@src/components/ui/AlertMessage';
import { DEFAULT_GENERATE_RESET_PASSWORD_ERROR_MESSAGE } from '@src/constants';
import { generatePasswordResetId } from '@src/util/auth';
import { getErrorObjectMessage } from '@src/util/errors';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { valibotResolver } from 'mantine-form-valibot-resolver';
import * as v from 'valibot';

const formSchema = v.object({
	email: v.pipe(v.string(), v.trim(), v.email('Please enter a valid email address'))
});

type TFormValues = v.InferInput<typeof formSchema>;

const ResetPassword: React.FC = () => {
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			email: ''
		},
		validate: valibotResolver(formSchema)
	});

	const generatePasswordResetIdMutation = useMutation({
		mutationFn: (values: { email: string }) => {
			return generatePasswordResetId(values.email);
		}
	});

	const handleResetRequest = async (values: TFormValues) => {
		generatePasswordResetIdMutation.mutate({ email: values.email });
	};

	return (
		<>
			{generatePasswordResetIdMutation.isError && (
				<AlertMessage type="error">
					{getErrorObjectMessage(
						generatePasswordResetIdMutation.error,
						DEFAULT_GENERATE_RESET_PASSWORD_ERROR_MESSAGE
					)}
				</AlertMessage>
			)}
			<Card shadow="sm" padding="lg" radius="md" withBorder>
				{generatePasswordResetIdMutation.isSuccess ? (
					<p>{generatePasswordResetIdMutation.data.message}</p>
				) : (
					<form
						onSubmit={form.onSubmit(handleResetRequest)}
						aria-disabled={generatePasswordResetIdMutation.isPending}
					>
						<FormControlsDisabledContainer
							disabled={generatePasswordResetIdMutation.isPending}
						>
							<TextInput
								label="Email"
								withAsterisk
								autoFocus
								key={form.key('email')}
								{...form.getInputProps('email')}
							/>
							<Divider my="lg" />
							<Button
								type="submit"
								fullWidth
								loading={generatePasswordResetIdMutation.isPending}
							>
								Reset Password
							</Button>
						</FormControlsDisabledContainer>
					</form>
				)}
			</Card>
			<Link to="/login" disabled={generatePasswordResetIdMutation.isPending}>
				Back to login
			</Link>
		</>
	);
};

export const Route = createFileRoute('/_auth/reset-password/')({
	component: () => <ResetPassword />
});
