# Changelog

## [1.2.1](https://github.com/RHS-Coding-Club/rhs-coding-club/compare/v1.2.0...v1.2.1) (2026-11-05)


### Bug Fixes

* take every color from the theme tokens in styles.css ([#113](https://github.com/RHS-Coding-Club/rhs-coding-club/issues/113)) ([1b3f711](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/1b3f71192de50738ca89d2c18c208e5b9ef98cf4))


### Performance Improvements

* serve resized images, self-host fonts, and paint heroes before hydration ([#115](https://github.com/RHS-Coding-Club/rhs-coding-club/issues/115)) ([20d995c](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/20d995c0991d7fcd4cda256cab3e8c6626cc90cf))

## [1.2.0](https://github.com/RHS-Coding-Club/rhs-coding-club/compare/v1.1.0...v1.2.0) (2026-11-02)


### Features

* add a default Open Graph image for link previews ([#110](https://github.com/RHS-Coding-Club/rhs-coding-club/issues/110)) ([07b1c0b](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/07b1c0b5c719e1e79d1becddab1126c9da50c433))

## [1.1.0](https://github.com/RHS-Coding-Club/rhs-coding-club/compare/59551d2...v1.1.0) (2026-11-02)


### Features

* add Turnstile to email forms and configurable automatic backups ([#107](https://github.com/RHS-Coding-Club/rhs-coding-club/issues/107)) ([5add715](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/5add715b88d2edfef90ec3ad38dcc98b0e433b21))


## [1.0.0](https://github.com/RHS-Coding-Club/rhs-coding-club/tree/59551d2) (2026-11-02)

Rewrite of the site from scratch on TanStack Start and Cloudflare Workers, D1, and R2. First version under release automation; there is no `v1.0.0` tag.


### ⚠ BREAKING CHANGES

* replace the Next.js, Firebase, and Vercel app with TanStack Start on Cloudflare Workers, D1, and R2 ([42b8e19](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/42b8e19))
* sign-in moves to Better Auth; imported members claim their accounts through Google, GitHub, or a password reset ([42b8e19](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/42b8e19), [b66c994](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/b66c994))
* email moves from Brevo to the club Gmail account over SMTP ([f691683](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/f691683))


### Features

* **foundation:** Drizzle schema and migrations, Better Auth with Google, GitHub, and email/password, role middleware, seed script, and unit, integration, and e2e test suites ([42b8e19](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/42b8e19))
* **foundation:** schema additions, points ledger, badge engine, R2 uploads, Tiptap rich text, Worker cron triggers, and shared page components ([6fe7ebd](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/6fe7ebd))
* **pages:** app shell, home, about, and admin shell with the new identity, and Zod-validated settings groups ([deb61f1](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/deb61f1))
* **pages:** challenges, events with RSVP, code and QR check-in, .ics feeds, and a projector view, team projects, blog with RSS, leaderboard, member profiles, resources, contact, newsletter unsubscribe, privacy, and terms ([77fb062](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/77fb062))
* **members:** dashboard, account settings, the /join application, and GitHub org invite requests ([77fb062](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/77fb062))
* **admin:** applications, submissions, challenges, events and attendance, projects, blog, resources, badges, GitHub org, newsletter, messages, users and roles, officers, and settings ([77fb062](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/77fb062))
* **admin:** reset data tool with presets, a backup download, and new points seasons ([68ff31c](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/68ff31c))
* **jobs:** new-challenge announcements, event reminders, GitHub join sync, and the weekly digest ([77fb062](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/77fb062))
* **import:** import the old Firebase site's data and images, and add forgot and reset password pages ([b66c994](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/b66c994))
* **auth:** confirm email on password sign-up, with the same answer whether or not an address has an account ([0a908af](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/0a908af))
* **email:** send through the club Gmail account, free and with no domain needed ([f691683](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/f691683))
* **mcp:** add an MCP server so officers and admins can run the admin panel from an AI app, with OAuth sign-in, role checks, website approval for risky tools, and an AI access page ([d3e37e3](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/d3e37e3), [#101](https://github.com/RHS-Coding-Club/rhs-coding-club/issues/101))
* **security:** add security headers and per-IP rate limits on auth and public forms ([261a9cd](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/261a9cd))
* **design:** redesign the header, home, about, and auth pages with React Bits, and add RaisedButton site-wide ([3a25dc3](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/3a25dc3))
* **design:** second pass across auth, admin dock navigation, dashboard, blog, contact, GitHub, and 404 pages ([7c984a3](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/7c984a3))
* **design:** use Gradient ASCII as the home hero background ([89d32b4](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/89d32b4))
* **design:** earlier home page explorations, replaced by the redesign above ([c59d844](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c59d844), [4b6950f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/4b6950f), [970b3c7](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/970b3c7), [a491143](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/a491143), [61cdefc](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/61cdefc), [11ea7a7](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/11ea7a7), [6b8391e](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/6b8391e), [9aa38cc](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/9aa38cc))
* **brand:** use the real club logo in the header, footer, favicon, and app icons ([c0a8593](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c0a8593))
* **seed:** add a remote seed mode for demo content without login accounts ([5836899](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/5836899))


### Bug Fixes

* **security:** merge imported data only into verified accounts, and drop unsafe stored links ([387d771](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/387d771))
* **security:** delete R2 files only when nothing still references them ([9040514](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/9040514))
* **security:** strip line breaks from email headers, spend the Gmail allowance in tiers, cap reset emails, and refuse password sign-up on bootstrap addresses ([ad1cac3](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/ad1cac3))
* **security:** stop revealing bootstrap addresses at sign-up ([6c69b7d](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/6c69b7d))
* **security:** limit sign-up mail per address, and confirm email with a button so mail scanners can't confirm accounts ([ad2f65c](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/ad2f65c))
* **mcp:** refuse approvals whose contents changed, show whole newsletters on approval, require approval to accept members or send org invites, and stop image downloads at 5 MB ([634490e](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/634490e), [#102](https://github.com/RHS-Coding-Club/rhs-coding-club/issues/102))
* **events:** stop the RSVP snapping back when the toast fires ([3359c44](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/3359c44))
* **design:** line up the navbar notch with the top edge and the hero card ([6298560](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/6298560), [5416292](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/5416292), [55be73d](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/55be73d), [1a060a8](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/1a060a8))
* make the per-inbox email limits atomic, wait for fresh data after mutations, stub GSAP in the Worker build, and fix contrast, list markup, labels, and roles found by an axe audit ([261a9cd](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/261a9cd))


### Styles

* use site colors for the Stepper and the expired reset link ([c58ec41](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c58ec41))
* use Aero Shards on the projector view, and keep blog tags on one line ([71946cc](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/71946cc))
* put shader heroes on the site's dark surface ([e054596](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/e054596))
* run the page hero edge to edge from the top of the page ([a37e187](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/a37e187), [a00f54c](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/a00f54c))
* format Masonry ([49bc151](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/49bc151))


### Documentation

* describe the points window as coming from `pointsWindowStart` ([ec91242](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/ec91242))
* remove Firebase from the PR template, and use bun in it ([02f91dd](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/02f91dd), [e3bbc36](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/e3bbc36))


### Tests

* wait for hydration before toggling the theme in e2e ([f00a76f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/f00a76f))
* use a realistic avatar key in the profile test ([06a1220](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/06a1220))


### Miscellaneous

* remove the home page design to rebuild it one component at a time ([905f1c4](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/905f1c4))
* wire production D1, R2, and `APP_URL` ([d49c477](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/d49c477)), then deploy to the club Cloudflare account ([c93fa60](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c93fa60))
* fix security scanning and patch vulnerable dependencies ([f83c718](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/f83c718), [#103](https://github.com/RHS-Coding-Club/rhs-coding-club/issues/103))
* set up issue forms, scanning, release-please, and repo tooling, and set the version to 1.0.0 ([59551d2](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/59551d2), [#106](https://github.com/RHS-Coding-Club/rhs-coding-club/issues/106))


## [0.1.0](https://github.com/RHS-Coding-Club/rhs-coding-club/tree/08524d8) (2026-08-12)

The original Next.js and Firebase site, from September 2025 to August 2026. It stayed at version 0.1.0 throughout and was never tagged, so everything is listed here.


### Features

* **foundation:** initial Next.js setup, authentication, and Firestore collections and rules ([1f2ff41](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/1f2ff41), [6751c0f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/6751c0f), [c50f292](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c50f292), [11a4305](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/11a4305))
* **home:** featured projects carousel and latest posts ([847ffb1](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/847ffb1)), project links on featured titles ([9559806](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/9559806)), PixelBlast hero background ([935c38a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/935c38a)), and an animated footer text effect ([76368ef](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/76368ef))
* **events:** creation, editing, filtering, and RSVP ([a499aff](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/a499aff))
* **projects:** submission form, admin approval and editing, filters ([51363a7](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/51363a7)), and image uploads ([b2e879a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/b2e879a))
* **resources:** management and filtering ([86a31f1](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/86a31f1)), and bookmarks ([8a86c6a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/8a86c6a))
* **challenges:** challenges, submissions, review, and leaderboard ([7fa01d7](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/7fa01d7)), points tracking ([ce56958](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/ce56958)), and multiple file uploads and project links on submissions ([c446799](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c446799))
* **blog:** post creation, editing, and deletion ([e77a2af](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/e77a2af)), and improved markdown rendering ([1605b35](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/1605b35))
* **membership:** contact form and club membership ([7c34eef](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/7c34eef)), unique email validation when joining ([55d9f12](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/55d9f12)), role-based visibility of the join links ([dddd625](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/dddd625)), and a membership application ([3177175](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/3177175))
* **newsletter:** subscriptions and welcome emails through Brevo ([2fdfef9](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/2fdfef9), [b9a689b](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/b9a689b))
* **dashboard:** data fetching and profile settings ([a2103ef](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/a2103ef)), project filtering and responsive navigation ([546b484](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/546b484)), and refreshed stats cards on the leaderboard, projects, and resources pages ([9d1600b](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/9d1600b))
* **accounts:** updated user and officer interfaces ([14843f9](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/14843f9)), account deletion ([11762bf](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/11762bf)), and GitHub sign-in ([507d6f2](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/507d6f2))
* **github:** org membership requests and admin management ([96270d0](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/96270d0)), and membership status checks ([6fb941e](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/6fb941e))
* **settings:** club ([0e881f5](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/0e881f5)), social media ([9f1eaf6](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/9f1eaf6)), points and gamification ([4f4fcec](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/4f4fcec)), GitHub organization ([19edbda](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/19edbda)), and email settings with test emails ([3ddc386](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/3ddc386))
* **badges:** badge system and manual awards ([5fc0901](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/5fc0901)), Hall of Fame and member profile pages ([d2e29ec](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/d2e29ec))
* **admin:** redesigned admin panel with a sidebar and challenges and events sections ([4475493](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/4475493)), and officer access to admin routes ([56b35ba](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/56b35ba))
* **ui:** responsive components, SEO structured data, and metadata utilities ([3b821e0](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/3b821e0)), themed text selection ([2a53e66](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/2a53e66)), an SVG logo ([131c14d](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/131c14d)), a resizable navbar ([21b4c0f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/21b4c0f)), and a tweakcn live preview script ([0357380](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/0357380))
* **seo:** dynamic routes in the sitemap ([98bded5](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/98bded5)), server-side sitemap data through the Firebase Admin SDK ([ef58403](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/ef58403)), and members and newsletter routes in the sitemap ([2d6707d](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/2d6707d))
* **analytics:** Vercel Speed Insights ([740d681](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/740d681)) and Vercel Analytics ([4fc0bfe](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/4fc0bfe))
* add a developer attribution link to the footer ([0ef071c](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/0ef071c))
* remove unused RSS feed generation code ([4797b6a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/4797b6a))


### Bug Fixes

* **security:** patch the Next.js and React Flight RCE vulnerability ([74f658d](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/74f658d))
* **security:** harden the GitHub service against SSRF ([1eb7904](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/1eb7904))
* **security:** add server-side auth checks to admin API routes, escape HTML in emails, fix N+1 queries, and replace the fake user rank with a real one ([f990cbe](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/f990cbe))
* **security:** block Bytespider and Google-Extended AI crawlers in robots.txt ([64ee3aa](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/64ee3aa))
* **firebase:** correct the school name in the membership requirement and the Firestore rules ([bb684fd](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/bb684fd)), and allow public reads of pending members ([4f8bfb5](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/4f8bfb5))
* **navbar:** prevent horizontal overflow and fix spacing ([76dffa3](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/76dffa3), [85b7195](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/85b7195), [5fde5e7](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/5fde5e7)), and stop page reloads from anchor tags ([8751aff](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/8751aff))
* **ui:** stop avatars stretching ([1494e6f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/1494e6f)), improve challenge text visibility ([f062ecf](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/f062ecf)), layout and responsiveness on admin, header, home, and project form ([4269e45](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/4269e45)), a better 404 back link ([6bac3be](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/6bac3be)), and global error page accessibility ([95198ca](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/95198ca))
* **footer:** correct the GitHub ([d94c67a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/d94c67a)) and Discord ([d4a479a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/d4a479a)) links
* allow tweakcn in the security headers ([f8c866e](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/f8c866e))
* configure Google user images, and fix the admin blog reload ([33a837c](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/33a837c))
* update domain references to rhscoding.club ([a721e61](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/a721e61))
* disable device capability checks for testing ([2513f69](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/2513f69))
* fix the admin challenges link, and refactor sandbox selection on the submission form ([c716ed1](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c716ed1))
* fix an apostrophe entity on the contact page and lint errors that blocked builds ([c8d9a9e](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c8d9a9e), [4514c6d](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/4514c6d), [873d226](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/873d226))


### Performance Improvements

* improve home page LCP by removing Framer Motion, lazy loading sections, and removing a blocking script ([320f165](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/320f165))
* improve rendering efficiency across components ([10e2ac3](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/10e2ac3))


### Code Refactoring

* clean up imports, types, and error handling ([dfc356a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/dfc356a))
* remove an unused import on the project detail page ([bee16d3](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/bee16d3))
* general bug fixes and theme changes ([0943ea7](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/0943ea7), [23915f1](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/23915f1))
* replace the email validation regex with `isProbablyValidEmail` ([afa6544](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/afa6544))
* use a static last modified date in the sitemap ([7845802](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/7845802))


### Documentation

* add the README, contributing guide, code of conduct, and security policy ([0afc6fd](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/0afc6fd))


### Dependencies

* **next:** 15.5.7 to 15.5.9 ([24fc43f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/24fc43f)), 15.5.12 ([1907b50](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/1907b50)), 15.5.15 ([c829bb9](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c829bb9)), and 15.5.23 ([60af81f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/60af81f)), then upgrade to 16.3.0 and fix its breaking changes ([69ab500](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/69ab500), [2cbb19f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/2cbb19f))
* **axios:** 1.13.2 to 1.18.0 ([9a56f0c](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/9a56f0c), [eef82cd](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/eef82cd), [5812da9](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/5812da9))
* **tar:** 7.4.3 to 7.5.16 ([01ef024](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/01ef024), [af78f1b](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/af78f1b), [ea4a128](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/ea4a128), [0cb56eb](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/0cb56eb), [a69628a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/a69628a), [e94541d](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/e94541d))
* **fast-xml-parser and @google-cloud/storage:** several bumps, reaching fast-xml-parser 5.10.1 ([74c1ac9](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/74c1ac9), [cb32966](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/cb32966), [e6102e5](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/e6102e5), [bdefcd7](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/bdefcd7))
* **js-yaml:** 4.1.1 to 4.3.1 ([99b5123](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/99b5123), [5abda7a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/5abda7a))
* **brace-expansion:** to 1.1.18 ([86097ac](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/86097ac), [08c938f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/08c938f))
* **fast-uri:** 3.1.0 to 3.1.5 ([5effebc](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/5effebc), [3fa224c](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/3fa224c))
* **single bumps:** lodash ([5f8fe47](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/5f8fe47)), @modelcontextprotocol/sdk ([7a2ceec](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/7a2ceec)), hono ([91282e2](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/91282e2)), @hono/node-server ([16e81f5](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/16e81f5)), svgo ([0928ab2](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/0928ab2)), ajv ([45ef5fc](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/45ef5fc)), flatted ([dcf28d0](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/dcf28d0)), picomatch ([c3f9c2f](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/c3f9c2f)), node-forge ([e77873d](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/e77873d)), follow-redirects ([eb845cb](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/eb845cb)), fast-xml-builder ([274616c](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/274616c)), @babel/plugin-transform-modules-systemjs ([975110a](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/975110a)), @protobufjs/utf8 ([7b602b7](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/7b602b7)), @tootallnate/once ([99d6c21](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/99d6c21)), qs ([2c02997](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/2c02997)), protobufjs ([b32c7ba](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/b32c7ba)), @grpc/grpc-js ([4bcbf6d](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/4bcbf6d)), form-data ([6694bef](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/6694bef)), and nanoid ([a8eb6ac](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/a8eb6ac))
* resolve remaining transitive advisories with `npm audit fix` ([b83f1d0](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/b83f1d0))


### Miscellaneous

* enforce LF line endings ([85de212](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/85de212))
* disable Vercel auto-deployments temporarily ([2648e81](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/2648e81)), then re-enable them ([d6d40d2](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/d6d40d2))
* update the GitHub Sponsors username ([08524d8](https://github.com/RHS-Coding-Club/rhs-coding-club/commit/08524d8))
