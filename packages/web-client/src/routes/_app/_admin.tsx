import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_admin')({
	component: () => <Outlet />,
	beforeLoad: ({ context }) => {
		// redirect to dashboard if the currently logged-in user doesn't have admin privileges
		if (!context.auth.user?.isAdmin) {
			throw redirect({ to: '/' });
		}
	}
});
