import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { setupServer } from 'msw/node';
import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import fmpApiHandlers from 'src/testing/msw-handlers/fmp-api.handlers';
import FMPClientService from './FMPClient.service';

describe('FMPClientService', () => {
	let service: FMPClientService;

	before(() => {
		setupServer(...fmpApiHandlers).listen();
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FMPClientService,
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
							if (key === 'FMP_API_KEY') {
								return 'fake-key-for-testing';
							}

							return null;
						}
					}
				}
			]
		}).compile();

		service = module.get<FMPClientService>(FMPClientService);
	});

	it('should be defined', () => {
		assert.notEqual(typeof service, 'undefined');
	});

	it('should reject with a response error', () => {
		assert.rejects(async () => {
			await service.getEarningsCalendar('2024-08-01', '2024-08-31');
		}, Error);
	});

	it('should be able to retrieve exchange symbols', () => {
		assert.doesNotReject(async () => {
			await service.getExchangeSymbols('NYSE');
		});
	});

	it('should be able to retrieve daily historical data', () => {
		assert.doesNotReject(async () => {
			await service.getDailyHistoricalData('AAPL');
		});
	});

	it('should be able to retrieve stock screener results', () => {
		assert.doesNotReject(async () => {
			await service.getStockScreenerResults();
		});
	});
});
