import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
	cleanup();
});

// add additional matches on 'expect' from testing-library
expect.extend(matchers);

// stub missing globals
const matchMediaMock = vi.fn((query) => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: vi.fn(), // deprecated
	removeListener: vi.fn(), // deprecated
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn()
}));

vi.stubGlobal('matchMedia', matchMediaMock);
