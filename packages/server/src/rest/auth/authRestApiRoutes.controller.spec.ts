import { Test, TestingModule } from '@nestjs/testing';
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { AuthRestApiRoutesController } from './authRestApiRoutes.controller';

describe('AuthRestApiRoutesController', () => {
	let controller: AuthRestApiRoutesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthRestApiRoutesController]
		}).compile();

		controller = module.get<AuthRestApiRoutesController>(AuthRestApiRoutesController);
	});

	it('should be defined', () => {
		assert.notEqual(typeof controller, 'undefined');
	});
});
