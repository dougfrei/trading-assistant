import { ConfigurableModuleBuilder } from '@nestjs/common';
import { IAuthTokensModuleOptions } from './interfaces/IAuthTokensModuleOptions';

export const {
	ConfigurableModuleClass: ConfigurableAuthTokensModule,
	MODULE_OPTIONS_TOKEN: AUTH_TOKENS_OPTIONS
} = new ConfigurableModuleBuilder<IAuthTokensModuleOptions>().setClassMethodName('forRoot').build();
