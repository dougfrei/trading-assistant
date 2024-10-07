export function getApiUrl(append: string): string {
	const apiUrl = (import.meta.env.VITE_API_URL ?? '').trim();

	if (!apiUrl) {
		return '';
	}

	return append ? [apiUrl, append].join('/') : apiUrl;
}
