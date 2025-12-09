<p align="center">
  <img src="assets/icon.png" alt="RHS Coding Club Logo" width="150" />
  <h1>RHS Coding Club Website</h1>
</p>

Welcome to the official repository for the Ripon High School's Coding Club website. This platform serves as the central hub for our members, featuring challenges, events, resources, and a showcase of student projects.

## 🚀 Overview

This website is designed to:
- **Connect Members**: Provide a space for students to join, track their progress, and participate in club activities.
- **Showcase Work**: Highlight student projects and achievements through a Hall of Fame and project gallery.
- **Manage Activities**: Host coding challenges, schedule events, and manage club resources.
- **Gamify Learning**: Implement a badge system and leaderboard to encourage participation and learning.

## ✨ Features

- **Home Page**: Overview of the club, recent stats, and featured content.
- **Challenges**: Interactive coding challenges for members to solve.
- **Events**: Calendar and details of upcoming club meetings and workshops.
- **Projects**: A gallery where members can showcase their personal or club projects.
- **Resources**: Curated learning materials and bookmarks.
- **Blog**: Articles and updates from the club.
- **Dashboard**: User-specific area to track badges, progress, and settings.
- **Leaderboard**: Rankings based on participation and challenge completion.
- **Admin Panel**: Tools for club officers to manage content, users, and settings.
- **GitHub Integration**: Link GitHub accounts for verification and automated badge awarding.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Shadcn UI](https://ui.shadcn.com/) & [Aceternity UI](https://ui.aceternity.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend / Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **Email**: [Brevo](https://www.brevo.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📂 Project Structure

```
rhs-coding-club/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   │   ├── api/         # Backend API endpoints
│   │   ├── (routes)/    # Page routes (about, blog, challenges, etc.)
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Base UI components (buttons, inputs, etc.)
│   │   └── ...          # Feature-specific components
│   ├── contexts/        # React Context providers (Auth, Settings, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and services
│   │   ├── firebase.ts  # Firebase client configuration
│   │   └── ...          # Other services (Brevo, GitHub, etc.)
└── ...config files      # Configuration files (Next.js, Tailwind, TS, etc.)
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/JashanMaan28/rhs-coding-club.git
    cd rhs-coding-club
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the following variables. You will need a Firebase project and other service accounts.

    ```env
      # Firebase Configuration
      NEXT_PUBLIC_FIREBASE_API_KEY=
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
      NEXT_PUBLIC_FIREBASE_APP_ID=
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

      # Brevo Configuration
      BREVO_API_KEY=
      BREVO_SENDER_EMAIL=
      BREVO_SENDER_NAME=

      # Site Configuration
      NEXT_PUBLIC_SITE_URL=http://localhost:3000


      # GitHub Organization Configuration
      # Replace 'your-github-org' with your actual GitHub organization name
      GITHUB_ORG_NAME=your-github-org

      # GitHub Personal Access Token with the following permissions:
      # - admin:org (for inviting users to organization)
      # - read:user (for reading user information)
      # Generate token at: https://github.com/settings/tokens/new
      GITHUB_TOKEN=your_github_personal_access_token_here


      # Firebase Admin SDK Configuration
      # These are needed for server-side authentication in API routes
      FIREBASE_PROJECT_ID=your-firebase-project-id
      FIREBASE_CLIENT_EMAIL=your-firebase-service-account-email
      FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----"
    
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 How to Contribute

We welcome contributions from club members and the community! Please read our [Contributing Guide](CONTRIBUTING.md) for detailed instructions on how to get started.

### Quick Start
1.  **Fork the repository** to your own GitHub account.
2.  **Create a new branch** for your feature or bug fix.
3.  **Make your changes** and commit them.
4.  **Push to your branch** and open a Pull Request.

### Coding Style
- We use **ESLint** and **Prettier**.
- Run `npm run lint` and `npm run format` before committing.

## 🤝 Code of Conduct

Please note that we have a [Code of Conduct](CODE_OF_CONDUCT.md). Please follow it in all your interactions with the project.

## 🛡️ Security

For information on how to report security vulnerabilities, please see our [Security Policy](SECURITY.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built by [Jashanpreet Singh](https://github.com/JashanMaan28).
- Special thanks to all our club officers.
