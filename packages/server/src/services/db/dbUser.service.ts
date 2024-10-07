import { Injectable, Logger } from '@nestjs/common';
import { DirectedOrderByStringReference } from 'kysely/dist/cjs/parser/order-by-parser';
import { Database } from 'src/db/db.module';
import { ITables } from 'src/db/types';
import { DbUsersNew, DbUsersUpdate } from 'src/db/types/tables/users';
import { User } from 'src/entities/User.model';
import { arrayUnique } from 'src/util/arrays';
import { getErrorObject } from 'src/util/errors';
import { hashPassword } from 'src/util/passwords';

export interface IGetUsersParams {
	search?: string;
	order?: DirectedOrderByStringReference<ITables, 'users', object>;
	limit?: number;
	offset?: number;
}

@Injectable()
export class DbUserService {
	private readonly logger = new Logger(DbUserService.name);

	constructor(private readonly db: Database) {}

	/**
	 * Retrieve a user record from the database by its ID
	 *
	 * @param userId The user record ID
	 * @returns User entity object or null if no record is found
	 */
	async getById(userId: number) {
		const userRecord = await this.db
			.selectFrom('users')
			.where('id', '=', userId)
			.selectAll()
			.executeTakeFirst();

		return userRecord ? User.fromDbRecord(userRecord) : null;
	}

	/**
	 * Retrieve a user record from the database by its name value
	 *
	 * @param username The user record username
	 * @returns User entity object or null if no record is found
	 */
	async getByUsername(username: string) {
		const userRecord = await this.db
			.selectFrom('users')
			.where('username', '=', username)
			.selectAll()
			.executeTakeFirst();

		return userRecord ? User.fromDbRecord(userRecord) : null;
	}

	/**
	 * Retrieve a user record from the database by its associated refresh token
	 *
	 * @param refreshToken The refresh token value
	 * @returns User entity object or null if no record is found
	 */
	async getByRefreshToken(refreshToken: string) {
		const userRecord = await this.db
			.selectFrom('users')
			// @ts-expect-error This should be working
			.where('refresh_tokens', '?', refreshToken)
			.selectAll()
			.executeTakeFirst();

		return userRecord ? User.fromDbRecord(userRecord) : null;
	}

	/**
	 * Retrieve a user record from the database by its associated activate ID value.
	 * No record will be returned if the matching user has already been activated.
	 *
	 * @param activateId The activate ID value
	 * @returns User entity object or null if no record is found
	 */
	async getByActivateId(activateId: string) {
		const userRecord = await this.db
			.selectFrom('users')
			.where('activate_id', '=', activateId)
			.where('active', '=', false)
			.selectAll()
			.executeTakeFirst();

		return userRecord ? User.fromDbRecord(userRecord) : null;
	}

	/**
	 * Construct the base users query used by other methods within this class
	 *
	 * @param param Query parameters
	 * @returns Kysely query object
	 */
	protected getUsersBaseQuery({
		search = ''
	}: Omit<IGetUsersParams, 'order' | 'limit' | 'offset'>) {
		let query = this.db.selectFrom('users');

		if (search) {
			query = query.where((eb) =>
				eb.or([
					eb('username', 'ilike', `%${search}%`),
					eb('display_name', 'ilike', `%${search}%`)
				])
			);
		}

		return query;
	}

	/**
	 * Retrieve multiple user records from the database
	 *
	 * @param params Query parameters
	 * @returns Array of User entity objects
	 */
	async getUsers(params: IGetUsersParams = {}) {
		let query = this.getUsersBaseQuery(params);

		if (typeof params.order !== 'undefined') {
			query = query.orderBy(params.order);
		}

		if (typeof params.limit !== 'undefined') {
			query = query.limit(params.limit);
		}

		if (typeof params.offset !== 'undefined') {
			query = query.offset(params.offset);
		}

		const records = await query.selectAll().execute();

		return records.map((record) => User.fromDbRecord(record));
	}

	/**
	 * Return the total number of user records returned by the provided query parameters
	 *
	 * @param params Query parameters
	 * @returns The total number of user records for the provided query parameters
	 */
	async getUsersCount(params: IGetUsersParams = {}) {
		const records = await this.getUsersBaseQuery(params)
			.select((builder) => builder.fn.countAll().as('count'))
			.executeTakeFirst();

		return Number(records?.count ?? 0);
	}

	/**
	 * Create a new user record in the database
	 *
	 * @param values The new user values object
	 * @returns User entity object or null if an error occurred
	 */
	async createUser(values: DbUsersNew) {
		try {
			const insertedRecord = await this.db
				.insertInto('users')
				.values(values)
				.returningAll()
				.executeTakeFirstOrThrow();

			return User.fromDbRecord(insertedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(err, 'An error occurred while creating a user record');

			this.logger.error({ stack: errObj.stack, createValues: values }, errObj.message);

			return null;
		}
	}

	/**
	 * Update an existing user record in the database
	 *
	 * @param userId The user record ID
	 * @param values The update values object
	 * @returns The updated User entity object or null if an error occurred
	 */
	async updateById(userId: number, values: Omit<DbUsersUpdate, 'id'>) {
		try {
			const updatedRecord = await this.db
				.updateTable('users')
				.set(values)
				.where('id', '=', userId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return User.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(err, 'An error occurred while updating the user record');

			this.logger.error(
				{ stack: errObj.stack, userId, updateValues: values },
				errObj.message
			);

			return null;
		}
	}

	/**
	 * Delete a user record from the database
	 *
	 * @param userId The user record ID
	 * @returns The deleted User entity object or null if an error occurred
	 */
	async deleteById(userId: number) {
		try {
			const deletedRecord = await this.db
				.deleteFrom('users')
				.where('id', '=', userId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return User.fromDbRecord(deletedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(err, 'An error occurred while deleting the user record');

			this.logger.error({ stack: errObj.stack, userId }, errObj.message);

			return null;
		}
	}

	/**
	 * Set the password for a user
	 *
	 * @param userId The user record ID
	 * @param plainTextPass The plaintext password
	 * @returns User entity record or null if an error occurred
	 */
	async setPassword(userId: number, plainTextPass: string) {
		const hashedPassword = await hashPassword(plainTextPass);

		const updatedUser = await this.updateById(userId, {
			password: hashedPassword
		});

		return updatedUser;
	}

	/**
	 * Clear the current refresh token values for a user and optionally set new values
	 *
	 * @param userId The user record ID
	 * @param newValues Optional array of strings to set as the user refresh tokens
	 * @returns User entity record or null if an error occurred
	 */
	async clearRefreshTokens(userId: number, newValues: string[] = []) {
		try {
			const user = await this.getById(userId);

			if (!user) {
				throw new Error('invalid user id specified');
			}

			const updatedRecord = await this.db
				.updateTable('users')
				.set('refresh_tokens', JSON.stringify(newValues))
				.where('id', '=', user.id)
				.returningAll()
				.executeTakeFirstOrThrow();

			return User.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while removing all refresh tokens for a user'
			);

			this.logger.error({ stack: errObj.stack, userId }, errObj.message);
		}

		return null;
	}

	/**
	 * Remove a specific refresh token from a user
	 *
	 * @param userId The user record ID
	 * @param removeToken The refresh token value to remove
	 * @returns User entity object or null if an error occurred
	 */
	async removeRefreshToken(userId: number, removeToken: string) {
		try {
			const user = await this.getById(userId);

			if (!user) {
				throw new Error('invalid user id specified');
			}

			const updatedTokens = user.refreshTokens.filter((token) => token !== removeToken);

			const updatedRecord = await this.db
				.updateTable('users')
				.set('refresh_tokens', JSON.stringify(updatedTokens))
				.where('id', '=', user.id)
				.returningAll()
				.executeTakeFirstOrThrow();

			return User.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while removing a user refresh token'
			);

			this.logger.error({ stack: errObj.stack, userId, removeToken }, errObj.message);
		}

		return null;
	}

	/**
	 * Add a refresh token value to a user record
	 *
	 * @param userId The user record ID
	 * @param addToken The refresh token value to add
	 * @returns User entity record or null if an error occurred
	 */
	async addRefreshToken(userId: number, addToken: string) {
		try {
			const user = await this.getById(userId);

			if (!user) {
				throw new Error('invalid user id specified');
			}

			const updatedTokens = arrayUnique([...user.refreshTokens, addToken]);

			const updatedRecord = await this.db
				.updateTable('users')
				.set('refresh_tokens', JSON.stringify(updatedTokens))
				.where('id', '=', user.id)
				.returningAll()
				.executeTakeFirstOrThrow();

			return User.fromDbRecord(updatedRecord);
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while adding a user refresh token'
			);

			this.logger.error({ stack: errObj.stack, userId, addToken }, errObj.message);
		}

		return null;
	}

	/**
	 * Replace an existing refresh token value with a new value for a user
	 *
	 * @param userId The user record ID
	 * @param oldToken The old refresh token value to replace
	 * @param newToken The new refresh token value to add
	 * @returns The current user refresh tokens as an array of strings or null if an error occurred
	 */
	async replaceRefreshToken(userId: number, oldToken: string, newToken: string) {
		try {
			const user = await this.getById(userId);

			if (!user) {
				throw new Error('invalid user id specified');
			}

			const newTokenValues = [
				...user.refreshTokens.filter((token) => token !== oldToken),
				newToken
			];

			const updatedRecord = await this.db
				.updateTable('users')
				.set({
					refresh_tokens: JSON.stringify(newTokenValues)
				})
				.where('id', '=', userId)
				.returningAll()
				.executeTakeFirstOrThrow();

			return User.fromDbRecord(updatedRecord).refreshTokens;
		} catch (err: unknown) {
			const errObj = getErrorObject(
				err,
				'An error occurred while removing all refresh tokens for a user'
			);

			this.logger.error({ stack: errObj.stack, userId }, errObj.message);
		}

		return null;
	}
}
