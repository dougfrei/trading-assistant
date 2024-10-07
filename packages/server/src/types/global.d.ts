import { User } from 'src/entities/User.model';

declare global {
	namespace Express {
		interface Request {
			user?: User;
			auth_clear_refresh_token_cookie?: boolean;
			auth_replace_refresh_token_cookie?: {
				userId: number;
				oldRefresh: string;
				newRefresh: string;
			};
			auth_set_access_token_header?: string;
		}
	}
}
