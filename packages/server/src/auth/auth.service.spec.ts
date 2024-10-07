import { Test, TestingModule } from '@nestjs/testing';
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { AuthService } from './auth.service';

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AuthService]
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		assert.notEqual(typeof service, 'undefined');
	});
});
