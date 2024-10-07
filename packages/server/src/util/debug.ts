/**
 * FOR TESTING PURPOSES ONLY!
 *
 * Return a Promise that will resolve after the specified timeout. This can be
 * useful when testing REST endpoint and GraphQL resolvers to simulate network
 * latency. The timeout will be ignored and the promise will resolve immediately
 * if the NODE_ENV environment variable is set to "production".
 *
 * @param timeoutInMs delay time in milliseconds
 * @returns A promise object that resolves after the specified timeout
 */
export const ASYNCHRONOUS_DELAY_FOR_TESTING = (timeoutInMs: number) => {
	return new Promise<void>((resolve) => {
		if (process.env.NODE_ENV === 'production') {
			resolve();
		}

		setTimeout(() => {
			resolve();
		}, timeoutInMs);
	});
};
