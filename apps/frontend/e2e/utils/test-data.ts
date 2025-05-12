/*
this file provides reusable helper functions for generating dynamic test data:
 - prevents hardcoded collisions (e.g., duplicate emails or job titles)
 - ensures every test runs with fresh, unique values
 - useful for signup, login, job creation, etc.
*/

// ✅ Generate a fake freelancer user with a unique name and email
export function generateFreelancer() {
    const timestamp = Date.now(); // generate a unique number based on current time
  
    return {
      name: `Test Freelancer ${timestamp}`, // e.g. "Test Freelancer 171545731"
      email: `freelancer-${timestamp}@example.com`, // e.g. "freelancer-171545731@example.com"
      password: 'Password123!' // constant password for simplicity
    };
  }
  
  // ✅ Generate a fake employer user with a unique company name and email
  export function generateEmployer() {
    const timestamp = Date.now(); // again, ensure uniqueness
  
    return {
      companyName: `Test Company ${timestamp}`, // e.g. "Test Company 171545731"
      email: `employer-${timestamp}@example.com`, // e.g. "employer-171545731@example.com"
      password: 'Password123!' // shared password format across test users
    };
  }
  
  // ✅ Generate a fake job posting with predefined fields and unique title
  export function generateJob() {
    const timestamp = Date.now(); // ensure job title is unique
  
    return {
      title: `Test Job ${timestamp}`, // e.g. "Test Job 171545731"
      description: 'This is a test job posting created via automation', // static description
      skills: ['JavaScript', 'React', 'Node.js'], // test with common skills
      minSalary: 3000,
      maxSalary: 5000
    };
  }
  
  /*
  ✅ All 3 functions:
   - return a plain object with consistent structure
   - can be directly passed into signup forms, job creation APIs, etc.
   - eliminate the risk of test data re-use and ensure independence across tests
  
  🧠 Tip:
  You can use these in your test like this:
  
      const freelancer = generateFreelancer();
      await signupPage.fillForm(freelancer); // or use directly fill: freelancer.email, freelancer.password
  
  Keeps your tests clean + reliable 💯
  */