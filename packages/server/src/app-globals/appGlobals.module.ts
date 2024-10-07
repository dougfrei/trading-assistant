import { Global, Module } from '@nestjs/common';
import { AppGlobalsService } from './appGlobals.service';

@Global()
@Module({
	providers: [AppGlobalsService],
	exports: [AppGlobalsService]
})
export class AppGlobalsModule {}
