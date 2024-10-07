import { createHash } from 'node:crypto';

/**
 * Create an MD5 hash from the provided stirng value
 *
 * @param source The string used to create the MD5 hash
 * @returns The MD5 hash value
 */
export function generateMD5(source: string): string {
	return createHash('md5').update(source).digest('hex');
}
