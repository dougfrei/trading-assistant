import { Center, Loader } from '@mantine/core';
import { EVENT_USER_AUTHENTICATION_ERROR } from '@src/graphql-request-client';
import { useAuth } from '@src/hooks/useAuth';
import { routeTree } from '@src/routeTree.gen';
import { removeAccessToken } from '@src/util/accessToken';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

// Create a new router instance
const router = createRouter({ routeTree, context: { auth: undefined! } }); // eslint-disable-line

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const RouterWrapper: React.FC = () => {
	const auth = useAuth();

	useEffect(() => {
		const handleAuthError = async () => {
			removeAccessToken();
			auth.clearUserState();

			await router.invalidate();

			setTimeout(() => {
				router.navigate({ to: '/login' });
			}, 0);
		};

		window.addEventListener(EVENT_USER_AUTHENTICATION_ERROR, handleAuthError);

		return () => {
			window.removeEventListener(EVENT_USER_AUTHENTICATION_ERROR, handleAuthError);
		};
	}, []);

	if (auth.isInitialAuthCheck) {
		return (
			<Center h="100vh">
				<Loader />
			</Center>
		);
	}

	return <RouterProvider router={router} context={{ auth }} />;
};

export default RouterWrapper;
