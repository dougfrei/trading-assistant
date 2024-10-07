import { Test, TestingModule } from '@nestjs/testing';
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { AppConfigService } from './appConfig.service';

describe('AppConfigService', () => {
	let service: AppConfigService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AppConfigService]
		}).compile();

		service = module.get<AppConfigService>(AppConfigService);
	});

	it('should be defined', () => {
		assert.notEqual(typeof service, 'undefined');
	});
});
