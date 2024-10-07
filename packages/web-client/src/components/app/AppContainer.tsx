import { AppShell } from '@mantine/core';
import { useAppContext } from '@src/context/AppContext';
import { Outlet, useMatchRoute } from '@tanstack/react-router';
import React from 'react';
import AppHeader from './AppHeader';
import AppNavbar from './AppNavbar';

const AppContainer: React.FC = () => {
	const { mobileMenuOpen } = useAppContext();
	const matchRoute = useMatchRoute();
	const isChartsLayout = matchRoute({ to: '/charts/$symbol', fuzzy: true });

	return (
		<AppShell
			header={{ height: { base: 60, md: 70, lg: 80 } }}
			navbar={{
				width: { base: 200, md: 200, lg: 225 },
				breakpoint: 'md',
				collapsed: { mobile: !mobileMenuOpen }
			}}
			padding={isChartsLayout ? 0 : 'md'}
		>
			<AppHeader />
			<AppNavbar />
			<AppShell.Main>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	);
};

export default AppContainer;
