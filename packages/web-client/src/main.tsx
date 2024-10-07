import { MantineProvider } from '@mantine/core';
import '@mantine/dates/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { AuthProvider } from '@src/context/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import RouterWrapper from './components/RouterWrapper';
import queryClient from './query-client';
import theme from './theme';

const rootRender = (
	<MantineProvider defaultColorScheme="dark" theme={theme}>
		<Notifications />
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RouterWrapper />
			</AuthProvider>
		</QueryClientProvider>
	</MantineProvider>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	parseInt(import.meta.env.VITE_REACT_STRICT_MODE) ? (
		<StrictMode>{rootRender}</StrictMode>
	) : (
		rootRender
	)
);
