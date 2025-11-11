# Repository Guidelines

**Last Updated:** November 10, 2025

## Branching Workflow

This project follows **GitHub Flow** - a simple, streamlined branching strategy perfect for continuous deployment. See [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md) for complete details.

**Key Points:**
- `main` branch is protected (requires pull requests, CI must pass)
- Feature branches: `feature/*`, `fix/*`, `chore/*`
- Dependabot branches: Grouped weekly updates on Mondays
- Short-lived branches (delete after merge)
- All commits follow Conventional Commit format
- All commits end with Claude Code attribution

**Quick Workflow:**
```bash
git checkout main && git pull
git checkout -b feature/your-feature
# Make changes
git push -u origin feature/your-feature
gh pr create --title "feat: Your Feature"
# After CI passes and PR approved
gh pr merge --squash --delete-branch
```

## Project Structure & Module Organization
The Meteo app is split between `frontend/` (React SPA) and `backend/` (Express API). In the client, feature code lives in `src/components` with shared hooks/context under `src/hooks` and `src/contexts`; API adapters sit in `src/services` and UI primitives in `src/utils` and `src/styles`. The API entry point is `backend/server.js`; request routing resides in `backend/routes`, reusable logic in `backend/services` and `backend/utils`, and persistence helpers in `backend/models`. Database DDL and seed scripts are stored in `/database`. Deployment manifests live in `deployment/` and shared scripts in `scripts/`.

## Build, Test, and Development Commands
Run `npm install` in both `frontend/` and `backend/` before local work. Use `cd frontend && npm start` for the React dev server, `npm run build` to produce the static bundle, and `npm test` (or `npm run test:coverage`) for Jest and Testing Library suites. On the API side, use `cd backend && npm run dev` for hot-reload with Nodemon and `npm start` for production mode. Database setup relies on `npm run db:init`, `npm run db:schema`, and `npm run db:seed`; ensure `DB_*` environment variables are present in `.env`.

## Coding Style & Naming Conventions
The frontend follows the default Create React App ESLint rules; stick to 2-space indentation, single quotes, and semicolons as used in existing files. Components and context providers use `PascalCase`, hooks `useCamelCase`, and utilities or tests `camelCase`. Backend modules are CommonJS; prefer async/await, early returns, and `snake_case` keys only when mirroring database columns.

## Testing Guidelines
Frontend tests live in `frontend/src/__tests__` or alongside components as `*.test.js`. Name suites after the component or hook under test and favor Testing Library queries over DOM traversal helpers. Run `npm run test:coverage` before pushing; the project enforces a ≥25% global threshold, so raise limits when you significantly exceed them. The backend currently lacks automated tests—add integration specs under `backend/tests` with Jest or Supertest when touching API logic, and document manual verification steps in your pull request.

## Commit & Pull Request Guidelines
Commits follow Conventional Commit prefixes (`fix:`, `docs:`, etc.); keep messages imperative and scoped to a single concern. Pull requests must summarise the change set, reference related issues, and list manual or automated test results. Attach screenshots or `curl` snippets when updating UI flows or API endpoints, and call out any schema or environment changes so reviewers can prepare migrations.
