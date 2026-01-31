# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the Next.js App Router entry points (e.g., `layout.tsx`, `page.tsx`) plus global styles in `globals.css`.
- `components/` contains shared React components, with `components/ui/` for reusable UI primitives and `components/crush-decoder/` for feature-specific UI.
- `hooks/` includes custom React hooks (e.g., `use-mobile.ts`).
- `lib/` provides shared utilities (e.g., `lib/utils.ts`).
- `public/` stores static assets served at the site root.
- `styles/` contains additional styling assets when needed.

## Build, Test, and Development Commands
Use `pnpm` (lockfile present) or `npm` if preferred.
- `pnpm dev`: run the local dev server (hot reload).
- `pnpm build`: compile the production build.
- `pnpm start`: start the production server after building.
- `pnpm lint`: run ESLint across the project.

## Coding Style & Naming Conventions
- TypeScript + React (Next.js). Follow existing patterns in `app/` and `components/`.
- File naming: use kebab-case for hooks/util files (`use-toast.ts`), PascalCase for React components, and Next.js route files (`page.tsx`, `layout.tsx`).
- Styling: Tailwind CSS with global styles in `app/globals.css`. Prefer utility classes for UI.

## Testing Guidelines
- No automated test framework is configured yet. If you add tests, document the framework, naming conventions, and commands here.
- When adding tests, mirror module structure (e.g., `components/...` → `components/.../*.test.tsx`).

## Commit & Pull Request Guidelines
- This directory is not currently a Git repository, so commit conventions are unknown. If you initialize Git, prefer concise, imperative commits (e.g., “Add theme provider”).
- PRs should include: a short summary, rationale, and screenshots for UI changes when applicable.

## Configuration & Tooling Notes
- Path aliases are configured in `tsconfig.json` (`@/*` maps to the repo root).
- Use `next.config.mjs` and `postcss.config.mjs` for build and CSS pipeline changes.
