import { ConfigurableModuleBuilder } from '@nestjs/common';
import { IDatabaseOptions } from 'src/db/types';

export const {
	ConfigurableModuleClass: ConfigurableDatabaseModule,
	MODULE_OPTIONS_TOKEN: DATABASE_OPTIONS
} = new ConfigurableModuleBuilder<IDatabaseOptions>().setClassMethodName('forRoot').build();
