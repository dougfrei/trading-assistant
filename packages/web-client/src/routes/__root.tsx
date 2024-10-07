import '@mantine/core/styles.css';
import { AuthContext } from '@src/context/AuthContext';
import { ErrorComponent, Outlet, createRootRouteWithContext } from '@tanstack/react-router';

interface IRouterContext {
	auth: AuthContext;
}

export const Route = createRootRouteWithContext<IRouterContext>()({
	component: () => <Outlet />,
	errorComponent: ({ error }) => <ErrorComponent error={error} />
});
