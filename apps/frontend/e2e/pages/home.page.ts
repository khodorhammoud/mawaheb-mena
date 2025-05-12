// Page Object Model (POM)

import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly navBar: Locator;
  readonly loginButton: Locator;
  readonly signupFreelancerButton: Locator;
  readonly signupEmployerButton: Locator;

  // ✅ these are called selectors (locators)
  // → they help us "find" the elements on the page → so we can click, type, assert, etc.

  // Class constructor → called when you create a new HomePage(page)
  constructor(page: Page) {
    this.page = page;

    // Initialize locators (queries that will point to elements on the page):

    this.navBar = page.locator('nav'); 
    // → similar to: document.querySelector('nav')
    // → finds <nav> element on the page

    this.loginButton = page.getByRole('link', { name: /login/i }); 
    // → finds a <a> or <button role="link"> whose accessible name matches "login" (case-insensitive)
    // Example: <a href="/login">Login</a>

    this.signupFreelancerButton = page.getByRole('link', { name: /signup as freelancer/i });
    // → finds a link whose name matches "signup as freelancer"

    this.signupEmployerButton = page.getByRole('link', { name: /signup as employer/i });
    // → finds a link whose name matches "signup as employer"
  } 

  // ✅ these below are actions (methods)
  // → they perform interactions with the page

  async goto() {
    await this.page.goto('/');
    // ✅ navigates browser to root path ("/")
  }

  async navigateToLogin() { 
    await this.loginButton.click();
    // ✅ clicks the login link found by getByRole earlier
  }

  async navigateToFreelancerSignup() {
    await this.signupFreelancerButton.click();
    // ✅ clicks the signup freelancer link
  }

  async navigateToEmployerSignup() {
    await this.signupEmployerButton.click();
    // ✅ clicks the signup employer link
  }
}

// ✅ Sample usage of this class inside a test:
/*
const homePage = new HomePage(page); // create a new instance
await homePage.goto(); // navigate to home page "/"
await homePage.navigateToLogin(); // click on login link
*/