# Project Context: Freelance Job Matching Platform

## Overview

This document provides a comprehensive context for the **Mawaheb MENA Freelance Job Matching Platform**, detailing its tech stack, architecture, authentication, session management, database structure, and feature implementations. This serves as a reference for AI-assisted development, ensuring accurate code generation and project continuity.

---

## Tech Stack

- **Frontend Framework:** [Remix Run](https://remix.run/)
- **Language:** TypeScript (`.ts` & `.tsx`)
- **Styling:** Tailwind CSS
- **UI Components:** [ShadCN](https://ui.shadcn.com/)
- **Backend:** Remix’s built-in loaders/actions for server-side processing
- **Database:** PostgreSQL
- **ORM:** [Drizzle](https://orm.drizzle.team/)
- **Session Management:** Remix's built-in `createCookieSessionStorage`
<!-- - **Hosting:** _[Specify if cloud-based, e.g., Vercel, AWS, GCP]_   -->
- **Authentication:** Using [Authenticator](https://remix.run/resources/remix-auth) from "remix-auth";

---

## Routing & File Structure

Remix follows a **file-based routing system**, where routes are determined through folder and file names.

### **General Route Structure**

- All routes are inside the `routes/` folder.
- A file inside `routes/` corresponds to an endpoint (e.g., `routes/api.jobs-related.ts` → `/api/jobs-related`).
- A folder inside `routes/` acts as a namespace (`routes/dashboard/` → `/dashboard`).
- Routes that begin with `_` (e.g., `_templatedashboard`) are **templates**.
- A route using a template is prefixed with the template’s name (e.g., `_templatedashboard.browse-jobs` → `/browse-jobs`).

### **Loader & Action Functions**

- If a file contains a `loader` function, it handles `GET` requests.
- If a file contains an `action` function, it handles `POST` requests.

### **Example Routes**

| File Path                                   | Route URL           | Request Type | Description                             |
| ------------------------------------------- | ------------------- | ------------ | --------------------------------------- |
| `routes/_templatedashboard.tsx`             | _(Template)_        | -            | Defines a template for routes using it. |
| `routes/_templatedashboard.browse-jobs.tsx` | `/browse-jobs`      | -            | Uses `_templatedashboard` template.     |
| `routes/api.jobs-related.ts`                | `/api/jobs-related` | GET/POST     | API route for jobs.                     |

---

## Authentication & Session Management

- Sessions are managed using Remix’s built-in session storage:
  ```ts
  import { createCookieSessionStorage } from "@remix-run/node";
  export const sessionStorage = createCookieSessionStorage({
    // Configuration here
  });
  ```

## Application Features & Data Flow

The application provides a job marketplace where employers post jobs, and freelancers apply for them. The admin acts as an intermediary, handling user verification, job application selection, and hiring.

### User Roles & Their Actions

| Role        | Actions                                               |
| ----------- | ----------------------------------------------------- |
| Freelancers | Register, fill out profile, apply for jobs.           |
| Employers   | Register, fill out company profile, post jobs.        |
| Admins      | Verify accounts, approve jobs, manage hiring process. |

### Freelancer Profile Fields

- Personal Info: Name, email, phone, social accounts.
- Languages Spoken.
- Skills & Experience Level.
- Hourly Rate & Total Experience.
- Introductory Video.
- Bio & Work History.
- Portfolio (Previous Projects).
- Certifications (With Attachments).
- Education.
- Account Verification: Admin-approved.

### Employer Profile Fields

- Company Details: Name, email, phone, social links.
- Industry Served.
- Average Project Budget.
- Years in Business.
- Company Description.
- Account Verification: Admin-approved.

### Job Posting Details

- Job Description.
- Preferred Working Hours.
- Field of Work.
- Experience Level Required.
- Statuses: Published, Pending, Draft, Deleted.

### Freelancer Job Application Process

1. Apply: Verified freelancers apply to jobs.
2. Admin Review: Admin evaluates applications.
3. Shortlist: Admin moves top applicants to the next stage.
4. Final Selection: Admin selects freelancers for hiring.
5. Job Start: Admin confirms with employer.

- ❌ Employers and freelancers do not communicate directly.
- ✅ All interactions happen via the admin.

### File Uploads:

Certifications, portfolio items, etc. uploaded to AWS S3.
