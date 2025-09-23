import { afterEach } from 'vitest';

// Clean up the DOM after each test (for React 18+)
afterEach(() => {
  document.body.innerHTML = '';
});
