import { Drawer, LoadingOverlay } from '@mantine/core';
import CommandPalette from '@src/components/CommandPalette';
import AppContainer from '@src/components/app/AppContainer';
import RiskCalculator from '@src/components/risk-calculator/RiskCalculator';
import { AppContextProvider, useAppContext } from '@src/context/AppContext';
import { createFileRoute, redirect } from '@tanstack/react-router';

const AppRoot: React.FC = () => {
	const { fullscreenLoaderActive, riskCalculatorOpen, setRiskCalculatorOpen } = useAppContext();

	return (
		<>
			<LoadingOverlay visible={fullscreenLoaderActive} />
			<AppContainer />
			<Drawer
				opened={riskCalculatorOpen}
				onClose={() => setRiskCalculatorOpen(false)}
				title="Risk Calculator"
				padding="lg"
				size="xl"
				position="right"
			>
				<RiskCalculator />
			</Drawer>
			<CommandPalette />
		</>
	);
};

export const Route = createFileRoute('/_app')({
	component: () => (
		<AppContextProvider>
			<AppRoot />
		</AppContextProvider>
	),
	beforeLoad: async ({ cause, context }) => {
		if (cause !== 'enter') {
			return;
		}

		// redirect to login page if not currently logged in
		if (!context.auth.isAuthenticated) {
			throw redirect({
				to: '/login'
			});
		}
	}
});
