import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbUserService } from 'src/services/db/dbUser.service';
import { DEFAULT_LOGIN_ERROR_MESSAGE } from 'src/util/constants';
import { comparePasswordToHash } from 'src/util/passwords';

@Injectable()
export class AuthService {
	constructor(private dbUserService: DbUserService) {}

	async signIn(username: string, plainTextPassword: string) {
		const user = await this.dbUserService.getByUsername(username);

		if (!user) {
			throw new UnauthorizedException(DEFAULT_LOGIN_ERROR_MESSAGE);
		}

		if (user.activateId.length > 0) {
			throw new UnauthorizedException(
				'This account has not been activated. Please refer to the activation instructions received via email.'
			);
		}

		if (!user.active) {
			throw new UnauthorizedException('This account is not currently active');
		}

		const verifiedPassword = await comparePasswordToHash(
			plainTextPassword.trim(),
			user.password
		);

		if (!verifiedPassword) {
			throw new UnauthorizedException(DEFAULT_LOGIN_ERROR_MESSAGE);
		}

		return user;
	}
}
