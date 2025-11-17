# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses npm scripts with Supabase CLI (cross-platform compatible):

```bash
# Start Supabase locally (starts all services)
npm run dev

# Stop all services
npm run stop

# Reset database and re-run migrations
npm run reset

# Apply migrations locally
npm run migrate

# Apply migrations to production
npm run migrate:prod

# View service status
npm run status

# View logs
npm run logs

# Open database shell
npm run shell

# Generate TypeScript types
npm run types

# Seed test data (users & posts)
npm run seed
```

## Test Data

Run `npm run seed` to populate the database with:
- **3 test users** (alice, bob, carol) - Password: `password123`
  - **Alice** - Admin user (`is_admin: true`)
  - **Bob** - Regular user
  - **Carol** - Regular user
- **6 sample posts** (mix of published and draft)
- **Follow relationships** between users

**Important Notes:**
- Passwords are hashed using PostgreSQL's `crypt()` with bcrypt (blowfish)
- `pgcrypto` extension is auto-enabled in seed.sql
- All auth.users columns are properly populated (no NULL strings)
- Email confirmation is auto-set (email_confirmed_at = NOW())
- Users can login immediately after seeding
- Perfect for development and testing Edge Functions!

## Architecture Overview

This is a Supabase CLI-based setup for local development. The CLI manages all Docker containers automatically.

### Core Services
All services are managed by Supabase CLI and run in Docker automatically:

- **PostgreSQL Database** (port 54322): Postgres with Supabase extensions
- **PostgREST API** (port 54321): Auto-generated REST API
- **Supabase Auth** (port 54321): Authentication service with OAuth support
- **Supabase Realtime** (port 54321): Real-time subscriptions via RLS
- **Supabase Storage** (port 54321): File storage service
- **Kong Gateway** (port 54321): API gateway routing (main entry point)
- **Inbucket** (port 54324): Email testing UI for development

### Database Management

**Migration Files:** `supabase/migrations/` with 5-digit sequential numbering (00000, 00001, etc.)
- Existing migrations:
  - 00000_create_helper_functions.sql - Helper functions for triggers
  - 00001_create_users_table.sql - User profiles table
  - 00002_create_posts_table.sql - Posts table
  - 00003_add_user_profiles.sql - User profiles enhancements
  - 00004_add_admin_role.sql - Admin role support
  - 00005_fix_handle_new_user_trigger.sql - Error handling for user creation
  - 00006_use_auth_admin_for_seed.sql - Documentation for seed approach
- Applied via `npm run migrate` which runs `supabase db push --local`
- Production: `npm run migrate:prod` runs `supabase db push`

**Configuration:** `supabase/config.toml`
- All Supabase CLI settings
- Database version, ports, schemas
- Auth providers and settings
- Storage configuration

### Environment Configuration

All configuration is in `supabase/config.toml`. No environment files needed for local development.

For production deployment:
- Set `SUPABASE_ACCESS_TOKEN` for authentication
- Set `PROJECT_ID` for your Supabase project reference
- Run `npm run link` to link to production project

### Edge Functions

**Location:** `supabase/functions/`
- **admin-create-user** - Create users with admin privileges
- **admin-list-users** - List all users (admin only)
- **admin-update-user** - Update user profiles (admin only)
- **admin-delete-user** - Delete users (admin only)
- **import_map.json** - Deno import configuration for dependencies
- **test-functions.ts** - Test suite for Edge Functions

All Edge Functions:
- Require authentication (Bearer token)
- Check admin role via `profiles.is_admin`
- Return JSON responses with CORS headers
- Auto-served by `supabase start`

### CI/CD Workflows

**`.github/workflows/ci.yml`:** (Main CI Pipeline)
- Runs on: `ubuntu-latest`
- Tests database migrations
- Seeds test data with proper auth schema
- Waits for services to be ready after reset
- Tests Edge Functions with Deno
- Comprehensive error logging and diagnostics

**Key CI Features:**
- Health checks for auth service
- Edge Functions endpoint verification
- Robust environment variable parsing
- Auto-serves Edge Functions during tests
- Tests login with seeded users
- Validates admin permissions

**`.github/workflows/deploy.yml`:**
- Deploys migrations to production
- Manual trigger only

## Development Workflow

1. **Initial Setup:**
   ```bash
   npm install -g supabase
   npm run dev
   ```

2. **Creating Migrations:**
   - Create new file: `supabase/migrations/00004_description.sql`
   - Use sequential numbering (next number after highest existing)
   - Apply with `npm run migrate`

3. **Database Access:**
   - Shell: `npm run shell`
   - Check status: `npm run status`
   - View connection string in status output

4. **Testing Migrations:**
   - Locally: `npm run reset` (full reset) or `npm run migrate` (incremental)
   - View diff: `npm run diff`
   - CI: Automatic validation on push/PR via GitHub Actions

## Migration Best Practices

- Use 5-digit sequential numbering (00000, 00001, 00002, etc.)
- Helper functions go in 00000_create_helper_functions.sql for reusability
- Enable Row Level Security (RLS) on all tables
- Test locally with `npm run diff` before applying
- Use `npm run reset` to test migrations from scratch

## Service Access

When services are running (`npm run dev`):
- **API Gateway:** http://localhost:54321 (main entry point via Kong)
- **Database:** Check `npm run status` for connection string
- **Email UI (Inbucket):** http://localhost:54324
- **Edge Functions:** http://localhost:54321/functions/v1/

All services are accessible through port 54321 (Kong gateway)

## Troubleshooting

### Login Issues

If authentication fails with "Invalid login credentials":
1. Ensure `pgcrypto` extension is enabled
2. Verify passwords are hashed with `crypt('password', gen_salt('bf'))`
3. Check that all required auth.users columns are non-NULL
4. Run `npm run seed` to recreate users with proper schema

**Required auth.users columns (must be non-NULL):**
- confirmation_token, email_change, email_change_token_new, email_change_token_current
- recovery_token, phone_change, phone_change_token, reauthentication_token

### CI/CD Issues

If CI fails:
1. **Auth service not ready** - The workflow waits 15s + 10 retries
2. **Edge Functions not responding** - Check edge-runtime container logs
3. **Environment variable parsing** - Uses case-insensitive grep + fallbacks
4. **Database reset timing** - Health checks ensure services are ready

View detailed logs in GitHub Actions for diagnostics.

### Edge Functions Issues

If Edge Functions aren't accessible:
1. Ensure Deno is installed (`deno --version`)
2. Check functions exist in `supabase/functions/`
3. Verify import_map.json is present
4. Edge Functions auto-serve with `supabase start`
5. Test endpoint: `curl http://localhost:54321/functions/v1/admin-create-user`

### Database Schema Issues

If migrations fail:
1. Check migration numbering is sequential
2. Verify helper functions in 00000_create_helper_functions.sql
3. Ensure RLS is enabled on all tables
4. Test with `npm run diff` before applying
5. Use `npm run reset` to start fresh