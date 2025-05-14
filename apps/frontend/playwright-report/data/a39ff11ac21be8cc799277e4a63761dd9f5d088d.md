# Test info

- Name: Employer job posting >> can create a new job posting
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\employer\job-posting.spec.ts:13:3

# Error details

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

    at LoginPage.goto (C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\pages\login.page.ts:42:21)
    at C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\employer\job-posting.spec.ts:8:21
```

# Test source

```ts
   1 | // Page Object Model (POM)
   2 |
   3 | import { Page, Locator } from '@playwright/test';
   4 |
   5 | export class LoginPage {
   6 |   readonly page: Page;
   7 |   readonly emailInput: Locator;
   8 |   readonly passwordInput: Locator;
   9 |   readonly loginButton: Locator;
  10 |   readonly errorMessage: Locator;
  11 |
  12 |   // ✅ these are called selectors (locators)
  13 |   // → they help us "find" the elements on the page → so we can click, type, assert, etc.
  14 |
  15 |   // Class constructor → called when you create a new LoginPage(page)
  16 |   constructor(page: Page) {
  17 |     this.page = page;
  18 |
  19 |     // Initialize locators (queries that will point to elements on the page):
  20 |
  21 |     this.emailInput = page.getByLabel('Email');
  22 |     // ✅ finds an <input> that has a <label> "Email"
  23 |     // Example HTML:
  24 |     // <label for="email">Email</label> <input id="email" ...>
  25 |
  26 |     this.passwordInput = page.getByLabel('Password');
  27 |     // ✅ finds input labeled "Password" → same logic
  28 |
  29 |     this.loginButton = page.getByRole('button', { name: /login/i });
  30 |     // ✅ finds a <button> (or element with role="button") whose accessible name matches "login" (case-insensitive)
  31 |     // Example: <button>Login</button>
  32 |
  33 |     this.errorMessage = page.locator('.error-message');
  34 |     // ✅ finds an element by CSS selector → class "error-message"
  35 |     // Example: <div class="error-message">Invalid credentials</div>
  36 |   }
  37 |
  38 |   // ✅ these below are actions (methods)
  39 |   // → they perform interactions with the page
  40 |
  41 |   async goto() {
> 42 |     await this.page.goto('/login');
     |                     ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  43 |     // ✅ navigates the browser to "/login" route
  44 |   }
  45 |
  46 |   async login(email: string, password: string) {
  47 |     await this.emailInput.fill(email);
  48 |     // ✅ fills the email input → replaces current value
  49 |
  50 |     await this.passwordInput.fill(password);
  51 |     // ✅ fills the password input → replaces current value
  52 |
  53 |     await this.loginButton.click();
  54 |     // ✅ clicks the login button → triggers form submission
  55 |   } 
  56 | }
  57 |
  58 | // ✅ sample of usage in a test:
  59 | /*
  60 | const login = new LoginPage(page); // create LoginPage instance
  61 | await login.goto(); // navigate to login page
  62 | await login.login('user@example.com', 'Password123'); // fill form + click login
  63 | */
```