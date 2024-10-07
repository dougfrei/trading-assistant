export function getErrorObjectMessage(err: unknown, defaultMessage = 'An error has occurred') {
	return err instanceof Error && err.message.trim() ? err.message.trim() : defaultMessage;
}
