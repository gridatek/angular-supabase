# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is an Angular + Supabase workspace with the following architecture:
- **Monorepo workspace**: Uses npm workspaces to manage multiple packages
- **Frontend app**: Angular 20+ application in `apps/frontend/`
- **Supabase backend**: Local development setup with PostgreSQL database
- **No packages**: Workspace is configured for `packages/*` but none exist yet

## Development Commands

### Database (Supabase)
```bash
# Start local Supabase stack (PostgreSQL, API, etc.)
npm run db:start

# Stop local Supabase stack
npm run db:stop

# Reset database to initial state
npm run db:reset

# Apply pending migrations
npm run db:migrate
```

### Frontend Development (Angular)
Navigate to `apps/frontend/` for all Angular commands:

```bash
cd apps/frontend

# Start development server (http://localhost:4200)
npm run start
# or
ng serve

# Build for production
npm run build
# or
ng build

# Run unit tests
npm run test
# or
ng test

# Watch mode build
npm run watch
```

### Code Generation
```bash
cd apps/frontend

# Generate new component
ng generate component component-name

# See all available schematics
ng generate --help
```

## Architecture Notes

### Angular Configuration
- **Angular 20+** with modern standalone components (no NgModules)
- **Signals-based** state management approach
- **Strict TypeScript** configuration
- **Karma + Jasmine** for testing
- **Prettier** configured with 100 character line width and single quotes

### Supabase Configuration
- **Local development**: Database on port 54322, API on port 54321
- **PostgreSQL 17**: Configured for local development
- **Project ID**: "supa"
- **API schemas**: public, graphql_public

### Code Standards
The frontend has comprehensive Angular coding standards defined in `apps/frontend/.claude/CLAUDE.md` including:
- Standalone components only
- Signal-based state management
- Modern control flow syntax (`@if`, `@for`, `@switch`)
- OnPush change detection strategy
- Reactive forms preferred over template-driven

## Development Workflow

1. Start Supabase backend: `npm run db:start`
2. Navigate to frontend: `cd apps/frontend`
3. Start development server: `npm run start`
4. Access application at http://localhost:4200
5. Run tests with: `npm run test`