import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { setupServer } from 'msw/node';
import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import polygonApiHandlers from 'src/testing/msw-handlers/polygon-api.handlers';
import { getNYMarketOpenDateObject } from 'src/util/date';
import PolygonClientService from './PolygonClient.service';

describe('PolygonClientService', () => {
	let service: PolygonClientService;

	before(() => {
		setupServer(...polygonApiHandlers).listen();
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PolygonClientService,
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
							if (key === 'POLYGON_API_KEY') {
								return 'fake-key-for-testing';
							}

							return null;
						}
					}
				}
			]
		}).compile();

		service = module.get<PolygonClientService>(PolygonClientService);
	});

	it('should be defined', () => {
		assert.notEqual(typeof service, 'undefined');
	});

	it('should be able to retrieve daily candles', () => {
		assert.doesNotReject(async () => {
			await service.getDailyCandles(getNYMarketOpenDateObject('2024-08-19'));
		});
	});

	it('should be able to retrieve stock splits', () => {
		assert.doesNotReject(async () => {
			await service.getStockSplitsForDate(getNYMarketOpenDateObject('2024-08-23'));
		});
	});

	it('should be able to retrieve market holidays', () => {
		assert.doesNotReject(async () => {
			await service.getUpcomingMarketHolidays();
		});
	});
});
