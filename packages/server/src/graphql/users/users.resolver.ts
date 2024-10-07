import { MailerService } from '@nestjs-modules/mailer';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Roles } from 'src/auth/roles.decorator';
import { DbUsersNew, DbUsersUpdate } from 'src/db/types/tables/users';
import { CurrentUser } from 'src/decorators/currentUser';
import { User as UserEntity } from 'src/entities/User.model';
import EUserRoleType from 'src/enums/EUserRoleType';
import { DbUserService, IGetUsersParams } from 'src/services/db/dbUser.service';
import { getFrontendUrl } from 'src/util/environment';
import { getErrorObject } from 'src/util/errors';
import { comparePasswordToHash, hashPassword } from 'src/util/passwords';
import { getServerHostname } from 'src/util/server';
import * as v from 'valibot';
import ChangeUserPasswordArgs from './changeUserPassword.args';
import CreateUserArgs from './createUser.args';
import DeleteUserArgs from './deleteUser.args';
import GetUsersArgs from './getUsers.args';
import { GetUsersResponse } from './getUsersResponse.model';
import UpdateUserArgs from './updateUser.args';
import { User } from './user.model';

@Resolver(() => User)
export class UsersResolver {
	private readonly logger = new Logger(UsersResolver.name);

	constructor(
		private readonly dbUserService: DbUserService,
		private mailerService: MailerService
	) {}

	@Query(() => User, { name: 'currentUser' })
	async getCurrentUser(@CurrentUser() user: UserEntity | null): Promise<User> {
		if (!user) {
			throw new GraphQLError('not logged in');
		}

		return User.fromEntity(user);
	}

	@Query(() => GetUsersResponse, { name: 'users' })
	@Roles([EUserRoleType.ADMIN])
	async getUsers(@Args() args: GetUsersArgs): Promise<GetUsersResponse> {
		const getUsersParams: IGetUsersParams = {
			limit: args.perPage,
			offset: (args.page - 1) * args.perPage
		};

		if (args.search) {
			getUsersParams.search = args.search;
		}

		const totalCount = await this.dbUserService.getUsersCount(getUsersParams);
		const users = await this.dbUserService.getUsers(getUsersParams);

		return {
			pagination: {
				currentPage: args.page,
				totalPages: Math.ceil(totalCount / args.perPage),
				perPage: args.perPage,
				totalRecords: totalCount
			},
			records: users.map((user) => User.fromEntity(user))
		};
	}

	@Mutation(() => User, { name: 'createUser' })
	@Roles([EUserRoleType.ADMIN])
	async createUser(@Args() args: CreateUserArgs): Promise<User> {
		// validate the arguments against the schema
		const validatedArgs = v.safeParse(CreateUserArgs.schema, args);

		if (!validatedArgs.success) {
			const mergedIssues = validatedArgs.issues.map((issue) => issue.message).join('; ');

			throw new GraphQLError(mergedIssues);
		}

		// check if an existing user with the same username exists
		const existingUser = await this.dbUserService.getByUsername(validatedArgs.output.username);

		if (existingUser) {
			throw new GraphQLError('This email address is already in use by another account');
		}

		// create the new user record
		const values: DbUsersNew = {
			username: validatedArgs.output.username,
			password: '',
			display_name: validatedArgs.output.displayName,
			roles: JSON.stringify(validatedArgs.output.roles),
			active: false
		};

		const newUser = await this.dbUserService.createUser(values);

		if (!newUser) {
			this.logger.error({ createUserValues: values }, 'Unable to create user');

			throw new GraphQLError('An error occurred while creating the new user');
		}

		// email the user an account activate password link
		const frontendUrl = getFrontendUrl();

		if (!frontendUrl) {
			await this.dbUserService.deleteById(newUser.id);

			this.logger.error(
				'The FRONTEND_URL environment variable must be set in order to send the account actviate email'
			);

			throw new InternalServerErrorException(
				'An error occurred while requesting an account activation link. Please try again.'
			);
		}

		const activateLink = `${frontendUrl}/activate-account/${newUser.activateId}`;

		try {
			await this.mailerService.sendMail({
				from: `"Trading Admin" <noreply@${getServerHostname()}>`,
				to: newUser.username,
				subject: 'Account activation link',
				text: `The following link can be used to activate your account: ${activateLink}`,
				html: `<p>The following link can be used to activate your account: <a href="${activateLink}">activate account</a></p>`
			});
		} catch (err: unknown) {
			const errObj = getErrorObject(err, '');

			this.logger.error(
				{ username: newUser.username, errorMessage: errObj.message },
				'Failed to send account activation email to new user'
			);
		}

		return User.fromEntity(newUser);
	}

	@Mutation(() => User, { name: 'updateUser' })
	async updateUser(
		@Args() args: UpdateUserArgs,
		@CurrentUser() user: UserEntity | null
	): Promise<User> {
		if (!user) {
			this.logger.error('Expected user object in updateUser resolver but none was provided');

			throw new GraphQLError('An error occurred while updating the user');
		}

		const ctxUserIsAdmin = user.roles.includes(EUserRoleType.ADMIN);
		let userId = user.id;

		// check if this is a request to update a non-self user
		if (args.id && args.id !== userId) {
			if (!ctxUserIsAdmin) {
				this.logger.error(
					{
						sourceUserId: user.id,
						targetUserId: args.id
					},
					'A non-admin user attempted to update another user'
				);

				throw new GraphQLError('An error occurred while updating the user');
			}

			userId = args.id;
		}

		if (!userId) {
			this.logger.error(
				{
					ctxUserId: user.id,
					argsUserId: args.id
				},
				'User id could not be determined'
			);

			throw new GraphQLError('An error occurred while updating the user');
		}

		const userRecord = await this.dbUserService.getById(userId);

		if (!userRecord) {
			this.logger.error('User record could not be retrieved', {
				ctxUserId: user.id,
				argsUserId: args.id
			});

			throw new GraphQLError('An error occurred while updating the user');
		}

		// validate update arguments with the schema
		const validatedArgs = v.safeParse(UpdateUserArgs.schema, args);

		if (!validatedArgs.success) {
			const mergedIssues = validatedArgs.issues.map((issue) => issue.message).join('; ');

			throw new GraphQLError(mergedIssues);
		}

		// prepare the update parameters
		const updateData: DbUsersUpdate = {};

		if (typeof validatedArgs.output.displayName !== 'undefined') {
			updateData.display_name = validatedArgs.output.displayName;
		}

		if (typeof validatedArgs.output.roles !== 'undefined') {
			if (!ctxUserIsAdmin) {
				throw new GraphQLError('Only administrators may assign roles to a user');
			}

			updateData.roles = JSON.stringify(validatedArgs.output.roles);
		}

		if (typeof validatedArgs.output.active !== 'undefined') {
			if (!ctxUserIsAdmin) {
				throw new GraphQLError('Only administrators may update the active state of a user');
			}

			if (userRecord.activateId && validatedArgs.output.active) {
				throw new GraphQLError(
					'This user account must first complete the initial setup before its active state can be changed'
				);
			}

			if (userId === user.id && !validatedArgs.output.active) {
				throw new GraphQLError('You may not deactive your own account');
			}

			updateData.active = validatedArgs.output.active;
		}

		// update the user record
		const updatedUser = await this.dbUserService.updateById(userRecord.id, updateData);

		if (!updatedUser) {
			throw new GraphQLError('An error occurred while updating the user');
		}

		return User.fromEntity(updatedUser);
	}

	@Mutation(() => User, { name: 'changeUserPassword' })
	async changeUserPassword(
		@Args() args: ChangeUserPasswordArgs,
		@CurrentUser() user: UserEntity | null
	) {
		if (!user || !user.id) {
			this.logger.error(
				'Expected user object in changeUserPassword resolver but none was provided'
			);

			throw new GraphQLError('An error occurred while changing your password');
		}

		const userRecord = await this.dbUserService.getById(user.id);

		if (!userRecord) {
			this.logger.error(`Could not find user with ID ${user.id}`);

			throw new GraphQLError('An error occurred while changing your password');
		}

		const validatedArgs = v.safeParse(ChangeUserPasswordArgs.schema, args);

		if (!validatedArgs.success) {
			const mergedIssues = validatedArgs.issues.map((issue) => issue.message).join('; ');

			throw new GraphQLError(mergedIssues);
		}

		const currentPasswordMatch = await comparePasswordToHash(
			validatedArgs.output.currentPassword,
			userRecord.password
		);

		if (!currentPasswordMatch) {
			throw new GraphQLError('Your current password is incorrect');
		}

		const hashedPassword = await hashPassword(validatedArgs.output.newPassword);

		const updatedUser = await this.dbUserService.updateById(userRecord.id, {
			password: hashedPassword
		});

		if (!updatedUser) {
			throw new GraphQLError('An error occurred while changing your password');
		}

		return User.fromEntity(updatedUser);
	}

	@Mutation(() => User, { name: 'deleteUser' })
	async deleteUser(@Args() args: DeleteUserArgs, @CurrentUser() user: UserEntity | null) {
		if (!user) {
			this.logger.error('Expected user object in deleteUser resolver but none was provided');

			throw new GraphQLError('An error occurred while deleting the user');
		}

		const ctxUserIsAdmin = user.roles.includes(EUserRoleType.ADMIN);
		let userId = user.id;

		// check if this is a request to delete a non-self user
		if (args.id && args.id !== userId) {
			if (!ctxUserIsAdmin) {
				this.logger.error(
					{
						sourceUserId: user.id,
						targetUserId: args.id
					},
					'A non-admin user attempted to delete another user'
				);

				throw new GraphQLError('An error occurred while deleting the user');
			}

			userId = args.id;
		}

		if (!userId) {
			this.logger.error(
				{
					ctxUserId: user.id,
					argsUserId: args.id
				},
				'User id could not be determined'
			);

			throw new GraphQLError('An error occurred while updating the user');
		}

		// check for a self-delete from an admin
		if (ctxUserIsAdmin && userId === user.id) {
			throw new GraphQLError('As an administrator you cannot delete your own account');
		}

		const deletedUser = await this.dbUserService.deleteById(userId);

		if (!deletedUser) {
			throw new GraphQLError('An error occurred while deleting the user');
		}

		return User.fromEntity(deletedUser);
	}
}
