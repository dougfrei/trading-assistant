import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './appConfig.service';

@Global()
@Module({
	providers: [AppConfigService],
	exports: [AppConfigService]
})
export class AppConfigModule {}
