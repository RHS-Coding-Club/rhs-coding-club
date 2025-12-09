# Contributing to RHS Coding Club Website

First off, thank you for considering contributing to the RHS Coding Club website! It's people like you that make this community such a great place to learn and grow.

This guide will help you get started with setting up your development environment and understanding our contribution workflow.

## 🚀 Getting Started

### 1. Fork and Clone
1.  Fork the repository to your own GitHub account.
2.  Clone your fork to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/rhs-coding-club.git
    cd rhs-coding-club
    ```
3.  Add the original repository as a remote (upstream):
    ```bash
    git remote add upstream https://github.com/JashanMaan28/rhs-coding-club.git
    ```

### 2. Install Dependencies
We use `npm` (or `yarn`/`pnpm`) to manage dependencies.
```bash
npm install
```

### 3. Environment Setup
Refer to the [README.md](./README.md#getting-started) for the list of required environment variables. You'll need to create a `.env.local` file in the root directory.

### 4. Run Locally
Start the development server:
```bash
npm run dev
```
The site will be available at `http://localhost:3000`.

## 👩‍💻 Development Workflow

### Branching Strategy
We recommend using descriptive branch names that include the type of change and a brief description.

-   **Features**: `feature/add-dark-mode`, `feature/new-challenge-page`
-   **Bug Fixes**: `fix/mobile-nav-overflow`, `fix/auth-error`
-   **Documentation**: `docs/update-readme`
-   **Chore**: `chore/update-dependencies`

1.  Make sure your `main` branch is up to date:
    ```bash
    git checkout main
    git pull upstream main
    ```
2.  Create a new branch:
    ```bash
    git checkout -b feature/your-feature-name
    ```

### Committing Changes
We encourage using **Conventional Commits** for clear history:
-   `feat: add new leaderboard component`
-   `fix: resolve hydration error on homepage`
-   `docs: update contributing guide`
-   `style: format code with prettier`
-   `refactor: simplify auth context`

### Pull Requests
1.  Push your branch to your fork:
    ```bash
    git push origin feature/your-feature-name
    ```
2.  Open a Pull Request (PR) on the original repository.
3.  Fill out the PR template or provide a clear description of your changes.
4.  Link any related issues (e.g., "Closes #123").

## 🎨 Coding Standards

### Tech Stack & Style
-   **Framework**: Next.js 15 (App Router).
-   **Language**: TypeScript. Please avoid `any` types whenever possible.
-   **Styling**: Tailwind CSS. Use utility classes over custom CSS files.
-   **Components**: Use functional components and React Hooks.
-   **UI Library**: We use Shadcn UI (built on Radix UI). Check `src/components/ui` for existing components before building new ones.

### Linting and Formatting
We use **ESLint** and **Prettier** to ensure code quality and consistent formatting.

-   **Check for errors**:
    ```bash
    npm run lint
    ```
-   **Check formatting**:
    ```bash
    npm run format:check
    ```
-   **Format code**:
    ```bash
    npm run format
    ```
-   **Type check**:
    ```bash
    npm run type-check
    ```

**Note**: Please run `npm run format` and `npm run lint:fix` before committing your changes.

## 📂 Project Structure Overview

-   `src/app`: Application routes and pages (Next.js App Router).
-   `src/components`: Reusable React components.
    -   `src/components/ui`: Base UI components (buttons, inputs, etc.).
-   `src/lib`: Utility functions, Firebase configuration, and services.
-   `src/hooks`: Custom React hooks.
-   `src/contexts`: React Context providers.
-   `public`: Static assets (images, icons).

## 🐛 Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub.
-   **Bugs**: Describe the issue, steps to reproduce, and expected behavior.
-   **Features**: Explain the feature, why it's useful, and how it might work.

## 👥 Roles

-   **Contributors**: Anyone who submits a PR.
-   **Officers/Admins**: Club officers who manage the repository, review PRs, and oversee the project.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.
