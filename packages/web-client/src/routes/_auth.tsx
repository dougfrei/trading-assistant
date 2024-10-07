import { Center, Stack } from '@mantine/core';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
	component: () => {
		return (
			<Center h="100vh">
				<Stack style={{ width: 'clamp(250px, 90vw, 500px)' }}>
					<Outlet />
				</Stack>
			</Center>
		);
	},
	beforeLoad: async ({ cause, context }) => {
		if (cause !== 'enter') {
			return;
		}

		// redirect to dashboard if logged in
		if (context.auth.isAuthenticated) {
			throw redirect({
				to: '/'
			});
		}
	}
});
