import { Global, Module } from '@nestjs/common';
import FMPClientService from 'src/data-sources/FMPClient.service';
import FMPCloudClientService from 'src/data-sources/FMPCloudClient.service';
import PolygonClientService from 'src/data-sources/PolygonClient.service';
import AlpacaClientService from './AlpacaClient.service';

@Global()
@Module({
	providers: [AlpacaClientService, FMPClientService, FMPCloudClientService, PolygonClientService],
	exports: [AlpacaClientService, FMPClientService, FMPCloudClientService, PolygonClientService]
})
export class DataSourcesModule {}
