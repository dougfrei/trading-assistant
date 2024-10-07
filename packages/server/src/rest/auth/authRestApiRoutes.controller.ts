import { MailerService } from '@nestjs-modules/mailer';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	InternalServerErrorException,
	Logger,
	Post,
	Query,
	Req,
	Res,
	UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { passwordSchema } from '@trading-assistant/common';
import { Request, Response } from 'express';
import { AuthTokensService } from 'src/auth-tokens/authTokens.service';
import { AuthService } from 'src/auth/auth.service';
import { CurrentUser } from 'src/decorators/currentUser';
import { DisableRefreshTokenRegeneration } from 'src/decorators/disableRefreshTokenRegeneration';
import { SkipAuthCheck } from 'src/decorators/skipAuthCheck';
import { User } from 'src/entities/User.model';
import { DbUserService } from 'src/services/db/dbUser.service';
import {
	generateResetId,
	getCurrentRefreshToken,
	getResetIdCacheKey,
	setResponseAccessTokenHeader,
	setResponseRefreshTokenCookie
} from 'src/util/auth';
import { getFrontendUrl } from 'src/util/environment';
import { getErrorObject } from 'src/util/errors';
import { hashPassword } from 'src/util/passwords';
import { getServerHostname } from 'src/util/server';
import * as v from 'valibot';

@Controller('auth')
export class AuthRestApiRoutesController {
	private readonly logger = new Logger(AuthRestApiRoutesController.name);

	constructor(
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		private authService: AuthService,
		private authTokensService: AuthTokensService,
		private dbUserService: DbUserService,
		private mailerService: MailerService,
		private configService: ConfigService
	) {}

	async getUserIdForResetId(resetId: string) {
		const cacheKey = getResetIdCacheKey(resetId);
		const storedUserId = await this.cacheManager.get<number>(cacheKey);

		return storedUserId ?? 0;
	}

	@SkipAuthCheck()
	@Post('reset-password')
	async resetPassword(@Body() resetDto: Record<string, string>) {
		const validateBody = v.safeParse(
			v.object({
				reset_id: v.pipe(v.string('"reset_id" is a required parameter'), v.trim()),
				new_password: passwordSchema('"new_password" is a required parameter')
			}),
			resetDto
		);

		if (!validateBody.success) {
			const mergedIssues = validateBody.issues.map((issue) => issue.message).join('; ');

			throw new InternalServerErrorException(
				`Error(s) occurred while validating the request body content: ${mergedIssues}`
			);
		}

		const { reset_id: resetId, new_password: newPassword } = validateBody.output;

		const userId = await this.getUserIdForResetId(resetId);

		if (!userId) {
			throw new UnauthorizedException('The reset link is invalid or has expired.');
		}

		const user = await this.dbUserService.getById(userId);

		if (!user) {
			throw new UnauthorizedException('Invalid user id specified');
		}

		const cacheKey = getResetIdCacheKey(resetId);

		// clear any existing refresh tokens for the user
		await this.dbUserService.clearRefreshTokens(userId);

		const updatedUser = await this.dbUserService.setPassword(userId, newPassword);

		if (!updatedUser) {
			throw new InternalServerErrorException(
				'An error occurred while updating your password. Please try again.'
			);
		}

		// delete the cache key containing the stored user ID so that it cannot be used again
		await this.cacheManager.del(cacheKey);

		return {
			success: true
		};
	}

	@SkipAuthCheck()
	@Post('validate-reset-password-id')
	async validateResetPasswordId(@Body() validateDto: Record<string, string>) {
		const validateBody = v.safeParse(
			v.object({
				reset_id: v.pipe(v.string('"reset_id" is a required parameter'), v.trim())
			}),
			validateDto
		);

		if (!validateBody.success) {
			const mergedIssues = validateBody.issues.map((issue) => issue.message).join('; ');

			throw new InternalServerErrorException(
				`Error(s) occurred while validating the request body content: ${mergedIssues}`
			);
		}

		const userId = await this.getUserIdForResetId(validateBody.output.reset_id);

		if (!userId) {
			throw new UnauthorizedException('The reset link is invalid or has expired.');
		}

		const user = await this.dbUserService.getById(userId);

		if (!user) {
			throw new UnauthorizedException('Invalid user id specified');
		}

		return {
			success: true
		};
	}

	@SkipAuthCheck()
	@Post('generate-reset-password-id')
	async generateResetPasswordId(@Body() resetDto: Record<string, string>) {
		const validateBody = v.safeParse(
			v.object({
				username: v.pipe(
					v.string('"username" is a required parameter'),
					v.trim(),
					v.email('The username must be a valid email address')
				)
			}),
			resetDto
		);

		if (!validateBody.success) {
			const mergedIssues = validateBody.issues.map((issue) => issue.message).join('; ');

			throw new InternalServerErrorException(
				`Error(s) occurred while validating the request body content: ${mergedIssues}`
			);
		}

		const user = await this.dbUserService.getByUsername(validateBody.output.username);

		if (!user) {
			throw new UnauthorizedException('Invalid username');
		}

		// clear any existing refresh tokens for the user
		await this.dbUserService.clearRefreshTokens(user.id);

		// generate a reset ID and email the user a reset password link
		const resetId = generateResetId();
		const cacheKey = getResetIdCacheKey(resetId);

		const cacheKeyTTLinMinutes = Number(
			this.configService.get('RESET_PASSWORD_ID_EXPIRE_MINUTES') ?? '15'
		);

		// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
		await this.cacheManager.set(cacheKey, user.id, { ttl: cacheKeyTTLinMinutes * 60 });

		// email the user a reset password link
		const frontendUrl = getFrontendUrl();

		if (!frontendUrl) {
			this.logger.error(
				'The FRONTEND_URL environment variable must be set in order to send the password reset email'
			);

			throw new InternalServerErrorException(
				'An error occurred while requesting a password reset link. Please try again.'
			);
		}

		const resetLink = `${frontendUrl}/reset-password/${resetId}`;

		try {
			await this.mailerService.sendMail({
				from: `"Trading Admin" <noreply@${getServerHostname()}>`,
				to: user.username,
				subject: 'Password reset link',
				text: `The following password reset link will be valid for 15 minutes: ${resetLink}`,
				html: `<p>The following link can be used to reset your password within the next 15 minutes: <a href="${resetLink}">reset password</a></p>`
			});
		} catch (err: unknown) {
			const errObj = getErrorObject(err, '');

			this.logger.error(
				{ username: user.username, errorMessage: errObj.message },
				'Unable to send password reset link email'
			);
		}

		return {
			success: true,
			message:
				'A message has been sent to your email address containing a link to reset your account password.'
		};
	}

	// validate-activate-id
	@SkipAuthCheck()
	@Post('validate-activate-id')
	async validateActivateId(@Body() params: Record<string, string>) {
		const validatedParams = v.safeParse(
			v.object({
				activate_id: v.pipe(
					v.string('"activate_id" is a required parameter'),
					v.uuid(),
					v.trim()
				)
			}),
			params
		);

		if (!validatedParams.success) {
			const mergedIssues = validatedParams.issues.map((issue) => issue.message).join('; ');

			throw new InternalServerErrorException(
				`Error(s) occurred while validating the request body content: ${mergedIssues}`
			);
		}

		const user = await this.dbUserService.getByActivateId(validatedParams.output.activate_id);

		if (!user) {
			throw new UnauthorizedException('The provided activation ID is not valid.');
		}

		return {
			success: true,
			user: user.toRestApiResponse()
		};
	}

	// activate-account
	@SkipAuthCheck()
	@Post('activate-account')
	async activateAccount(@Body() params: Record<string, string>) {
		const validatedParams = v.safeParse(
			v.object({
				activate_id: v.pipe(
					v.string('"activate_id" is a required parameter'),
					v.uuid(),
					v.trim()
				),
				password: passwordSchema('"password" is a required parameter')
			}),
			params
		);

		if (!validatedParams.success) {
			const mergedIssues = validatedParams.issues.map((issue) => issue.message).join('; ');

			throw new InternalServerErrorException(
				`Error(s) occurred while validating the request body content: ${mergedIssues}`
			);
		}

		const user = await this.dbUserService.getByActivateId(validatedParams.output.activate_id);

		if (!user) {
			throw new UnauthorizedException('The provided activation ID is not valid.');
		}

		const hashedPassword = await hashPassword(validatedParams.output.password);

		const updatedUser = await this.dbUserService.updateById(user.id, {
			password: hashedPassword,
			refresh_tokens: JSON.stringify([]),
			active: true,
			activate_id: ''
		});

		if (!updatedUser) {
			throw new InternalServerErrorException(
				'An error occurred while activating the specified account'
			);
		}

		return {
			success: true,
			user: user.toRestApiResponse()
		};
	}

	@SkipAuthCheck()
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async signIn(
		@Body() signInDto: Record<string, string>,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	) {
		const validatedParams = v.safeParse(
			v.object({
				username: v.pipe(
					v.string('"username" is a required parameter'),
					v.trim(),
					v.email('The username must be a valid email address')
				),
				password: v.pipe(
					v.string('"password" is a required parameter'),
					v.trim(),
					v.minLength(1)
				)
			}),
			signInDto
		);

		if (!validatedParams.success) {
			const mergedIssues = validatedParams.issues.map((issue) => issue.message).join('; ');

			throw new InternalServerErrorException(
				`Error(s) occurred while validating the request body content: ${mergedIssues}`
			);
		}

		const user = await this.authService.signIn(
			validatedParams.output.username,
			validatedParams.output.password
		);

		const accessToken = await this.authTokensService.generateAccessTokenForUserID(user.id);
		const refreshToken = await this.authTokensService.generateRefreshTokenForUserID(user.id);

		// we want to dispose of any old refresh token sent as a cookie with the
		// the login request
		const oldRefreshToken = getCurrentRefreshToken(request);

		if (oldRefreshToken) {
			await this.dbUserService.removeRefreshToken(user.id, oldRefreshToken);
		}

		await this.dbUserService.addRefreshToken(user.id, refreshToken);

		setResponseAccessTokenHeader(response, accessToken);
		setResponseRefreshTokenCookie(response, refreshToken);

		return user.toRestApiResponse();
	}

	@DisableRefreshTokenRegeneration()
	@HttpCode(HttpStatus.OK)
	@Post('logout')
	async signOut(
		@Query() query: Record<string, string>,
		@Req() request: Request,
		@CurrentUser() user: User | null,
		@Res({ passthrough: true }) response: Response
	) {
		if (!user) {
			throw new UnauthorizedException('You are not currently logged in');
		}

		const validateQuery = v.safeParse(
			v.object({
				logout_all_sessions: v.optional(
					v.pipe(v.unknown(), v.transform(Number), v.minValue(0)),
					0
				)
			}),
			query
		);

		const curRefreshToken = getCurrentRefreshToken(request);

		if (curRefreshToken && user.id) {
			if (validateQuery.success && validateQuery.output.logout_all_sessions) {
				await this.dbUserService.clearRefreshTokens(user.id);
			} else {
				await this.dbUserService.removeRefreshToken(user.id, curRefreshToken);
			}
		}

		response.clearCookie('refresh');

		return {
			success: true
		};
	}

	@HttpCode(HttpStatus.OK)
	@Get('user')
	async getCurrentUser(@CurrentUser() user: User | null) {
		if (!user) {
			throw new UnauthorizedException('No user information present in the request');
		}

		return user.toRestApiResponse();
	}
}
