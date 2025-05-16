# Test info

- Name: Signup flows >> freelancer signup process
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\auth\signup.spec.ts:18:3

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

    at HomePage.goto (C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\pages\home.page.ts:40:21)
    at C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\auth\signup.spec.ts:20:20
```

# Test source

```ts
   1 | // Page Object Model (POM)
   2 |
   3 | import { Page, Locator } from '@playwright/test';
   4 |
   5 | export class HomePage {
   6 |   readonly page: Page;
   7 |   readonly navBar: Locator;
   8 |   readonly loginButton: Locator;
   9 |   readonly signupFreelancerButton: Locator;
  10 |   readonly signupEmployerButton: Locator;
  11 |
  12 |   // ✅ these are called selectors (locators)
  13 |   // → they help us "find" the elements on the page → so we can click, type, assert, etc.
  14 |
  15 |   // Class constructor → called when you create a new HomePage(page)
  16 |   constructor(page: Page) {
  17 |     this.page = page;
  18 |
  19 |     // Initialize locators (queries that will point to elements on the page):
  20 |
  21 |     this.navBar = page.locator('nav'); 
  22 |     // → similar to: document.querySelector('nav')
  23 |     // → finds <nav> element on the page
  24 |
  25 |     this.loginButton = page.getByRole('link', { name: /login/i }); 
  26 |     // → finds a <a> or <button role="link"> whose accessible name matches "login" (case-insensitive)
  27 |     // Example: <a href="/login">Login</a>
  28 |
  29 |     this.signupFreelancerButton = page.getByRole('link', { name: /signup as freelancer/i });
  30 |     // → finds a link whose name matches "signup as freelancer"
  31 |
  32 |     this.signupEmployerButton = page.getByRole('link', { name: /signup as employer/i });
  33 |     // → finds a link whose name matches "signup as employer"
  34 |   } 
  35 |
  36 |   // ✅ these below are actions (methods)
  37 |   // → they perform interactions with the page
  38 |
  39 |   async goto() {
> 40 |     await this.page.goto('/');
     |                     ^ Error: page.goto: Target page, context or browser has been closed
  41 |     // ✅ navigates browser to root path ("/")
  42 |   }
  43 |
  44 |   async navigateToLogin() { 
  45 |     await this.loginButton.click();
  46 |     // ✅ clicks the login link found by getByRole earlier
  47 |   }
  48 |
  49 |   async navigateToFreelancerSignup() {
  50 |     await this.signupFreelancerButton.click();
  51 |     // ✅ clicks the signup freelancer link
  52 |   }
  53 |
  54 |   async navigateToEmployerSignup() {
  55 |     await this.signupEmployerButton.click();
  56 |     // ✅ clicks the signup employer link
  57 |   }
  58 | }
  59 |
  60 | // ✅ Sample usage of this class inside a test:
  61 | /*
  62 | const homePage = new HomePage(page); // create a new instance
  63 | await homePage.goto(); // navigate to home page "/"
  64 | await homePage.navigateToLogin(); // click on login link
  65 | */
```