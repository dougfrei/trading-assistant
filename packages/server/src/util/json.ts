/**
 * Convert a map object with string keys to a JSON-encoded string
 *
 * @param mapObj Map object with string keys
 * @returns JSON-encoded string representing the map
 */
export function mapToJSONstring(mapObj: Map<string, unknown>): string {
	return JSON.stringify(Object.fromEntries(mapObj));
}
