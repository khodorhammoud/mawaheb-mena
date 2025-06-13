// Page Object Model (POM)

import { Page, Locator } from '@playwright/test';


export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  // ✅ these are called selectors (locators)
  // → they help us "find" the elements on the page → so we can click, type, assert, etc.

  // Class constructor → called when you create a new LoginPage(page)
  constructor(page: Page) {
    this.page = page;

    // Initialize locators (queries that will point to elements on the page):

    this.emailInput = page.getByLabel('Email');
    // ✅ finds an <input> that has a <label for ....> "Email"
    // Example HTML:
    // <label for="email">Email</label> <input id="email" ...>

    this.passwordInput = page.getByLabel('Password');
    // ✅ finds input labeled "Password" → same logic

    this.loginButton = page.getByRole('button', { name: /login/i });
    // ✅ finds a <button> (or element with role="button") whose accessible name matches "login" (case-insensitive)
    // Example: <button>Login</button>

    this.errorMessage = page.locator('.error-message');
    // ✅ finds an element by CSS selector → class "error-message"
    // Example: <div class="error-message">Invalid credentials</div>
  }

  // ✅ these below are actions (methods)
  // → they perform interactions with the page

  async goto() {
    await this.page.goto('/login');
    // ✅ navigates the browser to "/login" route
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    // ✅ fills the email input → replaces current value

    await this.passwordInput.fill(password);
    // ✅ fills the password input → replaces current value

    await this.loginButton.click();
    // ✅ clicks the login button → triggers form submission
  } 
}

// ✅ sample of usage in a test:
/*
const login = new LoginPage(page); // create LoginPage instance
await login.goto(); // navigate to login page
await login.login('user@example.com', 'Password123'); // fill form + click login
*/