# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you have found a security vulnerability in the RHS Coding Club website, please report it to us immediately via the website's contact us page or our club's Discord channel.

**Links:** [Contact Us Page](https://www.rhscoding.club/contact), [Discord](https://discord.com/invite/UQR79bn6ZZ) 

Please include the following details in your report:
*   A description of the vulnerability.
*   Steps to reproduce the issue.
*   Potential impact of the vulnerability.
*   Any relevant code snippets or screenshots.

## Supported Versions

Only the latest version of the `main` branch is currently supported for security updates.

## Security Scope

### What to Look For
We encourage contributors to help us improve the security of the platform. Particular areas of interest include:

*   **Firebase Security Rules**:
    *   Bypasses in `firestore.rules` or `storage.rules`.
    *   Ensure `isAdminOrOfficer()` logic cannot be spoofed.
    *   Verify that users can only modify their own data (`request.auth.uid == userId`).
*   **API Routes (`src/app/api/*`)**:
    *   Ensure all sensitive endpoints (especially under `src/app/api/admin`) perform server-side authentication and role verification.
    *   Check for proper input validation to prevent injection attacks.
*   **Admin Panel (`src/app/admin/*`)**:
    *   Verify that these pages are inaccessible to non-admin users (both client-side redirection and server-side data fetching protection).
*   **Authentication & Authorization**:
    *   Issues with GitHub OAuth integration.
    *   Session management flaws.
*   **Data Exposure**:
    *   Accidental exposure of sensitive user data (emails, student IDs) in public API responses or Firestore queries.

### Out of Scope
*   DDoS attacks or other volume-based attacks.
*   Social engineering attacks against club members or officers.
*   Vulnerabilities in third-party dependencies (unless it's a misuse of the library).

## Contributor Guidelines

When contributing to this project, please adhere to the following security best practices:

1.  **Environment Variables**:
    *   **NEVER** commit `.env` files or hardcode secrets (API keys, private keys, tokens) in the code.
    *   Use `process.env` to access configuration.
    *   Ensure `NEXT_PUBLIC_` prefix is ONLY used for variables that are safe to be exposed to the browser.

2.  **Firebase Security**:
    *   Always test Firestore and Storage rules when modifying the data model.
    *   Do not use `allow read, write: if true;` in production rules.

3.  **Input Validation**:
    *   Validate all user inputs on both the client and server side.
    *   Sanitize data before rendering to prevent XSS (Next.js handles much of this, but be careful with `dangerouslySetInnerHTML`).

4.  **Dependencies**:
    *   Regularly check for vulnerable dependencies using `npm audit`.

## Response Process

1.  **Acknowledgment**: We will acknowledge receipt of your report within 48 hours.
2.  **Investigation**: The club officers/maintainers will investigate the issue to confirm the vulnerability.
3.  **Fix**: If confirmed, we will work on a patch in a private branch.
4.  **Disclosure**: Once the fix is deployed, we will credit you (if desired) and may publish a security advisory.

## Tech Stack Specifics

*   **Next.js**: We use the App Router. Ensure Server Actions and API routes are properly secured.
*   **Firebase**: We rely heavily on Firestore Rules for data security.
*   **Authentication**: We use GitHub/Google for authentication. Ensure the OAuth flow is not tampered with.

Thank you for helping keep the RHS Coding Club community safe!
