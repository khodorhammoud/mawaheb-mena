# Test info

- Name: Home page >> should load the home page
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\home.spec.ts:4:3

# Error details

```
Error: page.goto: net::ERR_ABORTED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

    at C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\home.spec.ts:6:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Home page', () => {
   4 |   test('should load the home page', async ({ page }) => {
   5 |     // Navigate to home page
>  6 |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_ABORTED at http://localhost:5173/
   7 |
   8 |     // Verify the page has loaded successfully
   9 |     const title = await page.title();
  10 |     expect(title).toBeTruthy();
  11 |
  12 |     // This test is primarily to verify the test environment works correctly
  13 |     // with the database connection
  14 |   });
  15 | });
  16 |
```