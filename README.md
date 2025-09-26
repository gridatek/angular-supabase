# Angular Supabase Workspace

A full-stack application demonstrating Angular 20+ with Supabase integration, featuring modern standalone components, signals-based state management, and comprehensive E2E testing.

## 🚀 Features

- **Angular 20+** with standalone components and signals
- **Supabase** integration for database and real-time features
- **PostgreSQL** database with migrations and seeding
- **Playwright** end-to-end testing
- **GitHub Actions** CI/CD pipeline
- **Monorepo** structure with npm workspaces

## 📋 Prerequisites

- Node.js 20+
- npm
- Docker (for Supabase local development)

## 🛠️ Project Structure

```
supa/
├── apps/
│   └── frontend/           # Angular application
├── supabase/
│   ├── migrations/         # Database migrations
│   └── seed.sql           # Sample data
├── .github/workflows/     # CI/CD pipelines
└── package.json          # Workspace configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd apps/frontend
npm install
```

### 2. Start Local Development

```bash
# Start Supabase (PostgreSQL, API, Auth, etc.)
npm run db:start

# Reset database with migrations and seed data
npm run db:seed

# Start Angular development server
cd apps/frontend
npm run start
```

The application will be available at `http://localhost:4200`

## 📊 Database

### Migrations

Database schema is managed through Supabase migrations in `supabase/migrations/`:

- `20240101000000_create_users_table.sql` - Creates users table with RLS

### Seed Data

Sample data is provided in `supabase/seed.sql` with 5 test users.

## 🧪 Testing

### Playwright E2E Tests

```bash
# Run E2E tests (headless)
cd apps/frontend
npm run e2e

# Run with UI for debugging
npm run e2e:ui

# Run in headed mode
npm run e2e:headed
```

### Full Stack Testing

```bash
# Complete test suite: DB → Build → Test → Cleanup
npm run test:e2e
```

## 🏗️ Available Scripts

### Database Commands

```bash
npm run db:start     # Start Supabase stack
npm run db:stop      # Stop Supabase stack
npm run db:reset     # Reset database
npm run db:seed      # Reset with seed data
```

### Frontend Commands

```bash
cd apps/frontend

npm run start        # Development server
npm run build        # Production build
npm run test         # Unit tests
npm run e2e          # E2E tests
```

## 🔧 Development

### Code Standards

The project follows modern Angular best practices:

- **Standalone components** (no NgModules)
- **Signals** for state management
- **OnPush** change detection strategy
- **Modern control flow** (`@if`, `@for`, `@switch`)
- **Function-based APIs** (`input()`, `output()`, `inject()`)

### Architecture

- **Frontend**: Angular 20+ SPA with Supabase client
- **Backend**: Supabase (PostgreSQL + API + Auth)
- **State Management**: Angular signals
- **Styling**: Component-scoped CSS
- **Testing**: Playwright for E2E

## 🚢 Deployment

The project includes GitHub Actions for automated testing:

- **CI Pipeline**: `.github/workflows/test.yml`
- **Database Setup**: PostgreSQL service + Supabase CLI
- **E2E Testing**: Playwright with multiple browsers
- **Artifact Upload**: Test reports and screenshots

## 📚 Learn More

- [Angular Documentation](https://angular.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Playwright Documentation](https://playwright.dev)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:e2e`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details