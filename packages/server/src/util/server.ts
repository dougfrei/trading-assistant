/**
 * Returns the HTTPS key filename value as set by the SERVER_HTTPS_KEY_FILE
 * environment variable, or an empty string if the environment variable is not set
 *
 * @returns The HTTPS key filename
 */
export function getServerHttpsKeyFilename(): string {
	return typeof process.env.SERVER_HTTPS_KEY_FILE === 'string'
		? process.env.SERVER_HTTPS_KEY_FILE.trim()
		: '';
}

/**
 * Returns the HTTPS cert filename value as set by the SERVER_HTTPS_CERT_FILE
 * environment variable, or an empty string if the environment variable is not set
 *
 * @returns The HTTPS cert filename
 */
export function getServerHttpsCertFilename(): string {
	return typeof process.env.SERVER_HTTPS_CERT_FILE === 'string'
		? process.env.SERVER_HTTPS_CERT_FILE.trim()
		: '';
}

/**
 * Returns the server hostname value as set by the SERVER_HOSTNAME environment
 * variable, or the default value of "localhost" if the environment variable is
 * not set
 *
 * @returns The server hostname
 */
export function getServerHostname() {
	return typeof process.env.SERVER_HOSTNAME === 'string'
		? process.env.SERVER_HOSTNAME.trim()
		: 'localhost';
}

/**
 * Returns the server port value as set by the SERVER_PORT environment variable,
 * or the default value of 3000 if the environment variable is not set
 *
 * @returns The server port
 */
export function getServerPort() {
	return typeof process.env.SERVER_PORT === 'number' ? process.env.SERVER_PORT : 3000;
}

/**
 * Constructs the server URL value based on HTTPS availability, the configured
 * hostname, and the configured port
 *
 * @returns The constructed server URL
 */
export function getServerURL() {
	const isHttps = getServerHttpsKeyFilename() && getServerHttpsCertFilename();

	return `${isHttps ? 'https' : 'http'}://${getServerHostname()}:${getServerPort()}`;
}

/**
 * Returns the CORS enabled value as set by the SERVER_ENABLE_CORS environment
 * variable, or the default value of false if the environment variable is not set
 *
 * @returns The CORS enabled value
 */
export function getServerCORSenabled() {
	return Boolean(process.env?.SERVER_ENABLE_CORS ?? false);
}

/**
 * Returns the CORS allow origin value as set by the SERVER_CORS_ALLOW_ORIGIN
 * environment variable, or an empty string if the environment variable is not set
 *
 * @returns The CORS allow origin value
 */
export function getServerCORSallowOrigin() {
	return typeof process.env.SERVER_CORS_ALLOW_ORIGIN === 'string'
		? process.env.SERVER_CORS_ALLOW_ORIGIN.trim()
		: '';
}
