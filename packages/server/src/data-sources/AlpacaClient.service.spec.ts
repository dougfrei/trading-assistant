import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { setupServer } from 'msw/node';
import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import alpacaApiHandlers from 'src/testing/msw-handlers/alpaca-api.handlers';
import AlpacaClientService from './AlpacaClient.service';

describe('AlpacaClientService', () => {
	let service: AlpacaClientService;

	before(() => {
		setupServer(...alpacaApiHandlers).listen();
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AlpacaClientService,
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
							if (key === 'ALPACA_API_KEY') {
								return 'fake-key-for-testing';
							} else if (key === 'ALPACA_API_SECRET') {
								return 'fake-secret-for-testing';
							}

							return null;
						}
					}
				}
			]
		}).compile();

		service = module.get<AlpacaClientService>(AlpacaClientService);
	});

	it('should be defined', () => {
		assert.notEqual(typeof service, 'undefined');
	});

	it('should be able to retrieve multi-ticker candles', () => {
		assert.doesNotReject(async () => {
			await service.getMultiTickerCandles(['SPY']);
		});
	});

	it('should be able to retrieve the market calendar', () => {
		assert.doesNotReject(async () => {
			await service.getCalendar();
		});
	});
});
