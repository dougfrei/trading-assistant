import { Module } from '@nestjs/common';
import { GCISManagerService } from 'src/services/gcisManager.service';
import { SectorsResolver } from './sectors.resolver';

@Module({
	providers: [SectorsResolver, GCISManagerService]
})
export default class SectorsGraphQLModule {}
