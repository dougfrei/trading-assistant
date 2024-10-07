import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { setupServer } from 'msw/node';
import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import fmpCloudApiHandlers from 'src/testing/msw-handlers/fmp-cloud-api.handlers';
import { getNYMarketOpenDateObject } from 'src/util/date';
import FMPCloudClientService from './FMPCloudClient.service';

describe('FMPCloudClientService', () => {
	let service: FMPCloudClientService;

	before(() => {
		setupServer(...fmpCloudApiHandlers).listen();
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FMPCloudClientService,
				{
					provide: CACHE_MANAGER,
					useValue: {
						get: () => undefined,
						set: () => undefined
					}
				},
				{
					provide: ConfigService,
					useValue: {
						get: (key: string) => {
							if (key === 'FMP_CLOUD_API_KEY') {
								return 'fake-key-for-testing';
							}

							return null;
						}
					}
				}
			]
		}).compile();

		service = module.get<FMPCloudClientService>(FMPCloudClientService);
	});

	it('should be defined', () => {
		assert.notEqual(typeof service, 'undefined');
	});

	it('should reject with a response error', () => {
		assert.rejects(async () => {
			await service.getDailyCandles(getNYMarketOpenDateObject('2024-08-19'));
		}, Error);
	});

	it('should be able to retrieve tradable symbols', () => {
		assert.doesNotReject(async () => {
			await service.getTradableSymbols();
		});
	});

	it('should be able to retrieve daily historical data', () => {
		assert.doesNotReject(async () => {
			await service.getDailyHistoricalData('SPY');
		});
	});

	it('should be able to retrieve stock screener results', () => {
		assert.doesNotReject(async () => {
			await service.getStockScreenerResults();
		});
	});
});
