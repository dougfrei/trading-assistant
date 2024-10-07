import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvService } from 'src/env/env.service';

@Module({
	providers: [EnvService, ConfigService],
	exports: [EnvService]
})
export class EnvModule {}
