import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { readFileSync } from 'node:fs';
import { UserConfigExport, defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	const config: UserConfigExport = {
		plugins: [tsconfigPaths(), react(), TanStackRouterVite()],
		server: {
			host: env.DEV_HOST ?? 'localhost',
			port: parseInt(env.DEV_PORT ?? '5173')
		},
		test: {
			environment: 'jsdom',
			globals: true,
			setupFiles: 'vitest.setup.ts'
		}
	};

	if (typeof env.DEV_HTTPS_KEY_FILE === 'string' && typeof env.DEV_HTTPS_CERT_FILE === 'string') {
		config.server = {
			https: {
				key: readFileSync(env.DEV_HTTPS_KEY_FILE),
				cert: readFileSync(env.DEV_HTTPS_CERT_FILE)
			}
		};
	}

	return config;
});
