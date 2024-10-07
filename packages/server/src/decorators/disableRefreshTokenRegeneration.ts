import { SetMetadata } from '@nestjs/common';

export const DisableRefreshTokenRegeneration = () =>
	SetMetadata('disableRefreshTokenRegeneration', true);
