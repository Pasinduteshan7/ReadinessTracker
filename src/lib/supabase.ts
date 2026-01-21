// DEPRECATED shim: re-export the in-memory backend mock from `backendMock.ts`.
// This file exists only to avoid breaking older imports that referenced a
// legacy provider-specific module name. Prefer importing from `src/lib/backendMock`
// or from `src/lib/api` in the future.

import backend, { __mockSeed__ } from './backendMock';

export { __mockSeed__ };
export default backend;
