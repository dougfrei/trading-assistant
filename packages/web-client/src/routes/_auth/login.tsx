import { Button, Card, Divider, Group, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import AlertMessage from '@src/components/ui/AlertMessage';
import { DEFAULT_LOGIN_ERROR_MESSAGE } from '@src/constants';
import { useAuth } from '@src/hooks/useAuth';
import { getErrorObjectMessage } from '@src/util/errors';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Link, useRouter } from '@tanstack/react-router';
import { valibotResolver } from 'mantine-form-valibot-resolver';
import { useRef } from 'react';
import * as v from 'valibot';

const formSchema = v.object({
	username: v.pipe(v.string(), v.trim(), v.email('Please enter a valid email address')),
	password: v.pipe(v.string(), v.trim(), v.minLength(1, 'Please enter your password'))
});

type TFormValues = v.InferInput<typeof formSchema>;

const Login: React.FC = () => {
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			username: '',
			password: ''
		},
		validate: valibotResolver(formSchema)
	});
	const usernameInputRef = useRef<HTMLInputElement>(null);
	const { login } = useAuth();
	const router = useRouter();

	const loginMutation = useMutation({
		mutationFn: (values: { username: string; password: string }) => {
			return login(values.username, values.password);
		},
		onSuccess: async () => {
			await router.invalidate();

			// NOTE: see the README for why this is wrapped in a zero-delay setTimeout
			setTimeout(() => {
				router.navigate({ to: '/' });
			}, 0);
		}
	});

	const handleLogin = async (values: TFormValues) => {
		loginMutation.mutate({
			username: values.username.trim(),
			password: values.password.trim()
		});
	};

	return (
		<>
			{loginMutation.isError && (
				<AlertMessage type="error">
					{getErrorObjectMessage(loginMutation.error, DEFAULT_LOGIN_ERROR_MESSAGE)}
				</AlertMessage>
			)}
			<Card shadow="sm" padding="lg" radius="md" withBorder>
				<form onSubmit={form.onSubmit(handleLogin)} aria-disabled={loginMutation.isPending}>
					<Stack>
						<TextInput
							ref={usernameInputRef}
							label="Email"
							withAsterisk
							required
							disabled={loginMutation.isPending}
							autoFocus
							key={form.key('username')}
							{...form.getInputProps('username')}
						/>
						<PasswordInput
							label="Password"
							withAsterisk
							required
							disabled={loginMutation.isPending}
							key={form.key('password')}
							{...form.getInputProps('password')}
						/>
					</Stack>
					<Divider my="lg" />
					<Group justify="space-between">
						<Link to="/reset-password">Reset password</Link>
						<Button type="submit" loading={loginMutation.isPending}>
							Login
						</Button>
					</Group>
				</form>
			</Card>
		</>
	);
};

export const Route = createFileRoute('/_auth/login')({
	component: () => {
		return <Login />;
	}
});
