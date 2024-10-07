import { compare, hash, hashSync } from 'bcrypt';

/**
 * Return the hashed value for a plaintext password. This method runs asynchronously.
 *
 * @param password The plaintext password to hash
 * @returns The hased value
 */
export async function hashPassword(password: string): Promise<string> {
	return await hash(password, 10);
}

/**
 * Return the hashed value for a plaintext password. This method runs synchronously.
 *
 * @param password The plaintext password to hash
 * @returns The hased value
 */
export function hashPasswordSync(password: string) {
	return hashSync(password, 10);
}

/**
 * Check if a plaintext password matches a hashed value
 *
 * @param plainText The plaintext password value
 * @param hash The hashed password value
 * @returns Boolean indicating that the values match
 */
export async function comparePasswordToHash(plainText: string, hash: string) {
	return await compare(plainText, hash);
}
