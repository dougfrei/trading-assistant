/**
 * Return the URL of the frontend application as set by the FRONTEND_URL environment
 * variable or an empty string if the environment variable is not set
 *
 * @returns The frontend application URL
 */
export function getFrontendUrl() {
	return typeof process.env.FRONTEND_URL === 'string' ? process.env.FRONTEND_URL.trim() : '';
}
