# Embedded example apps — automation (API + UI)

Playwright tests for the demo **Node server** (`server/nodejs`) and the **Next.js** app (`web/nextjs`), without importing either package. Tests use **`API_BASE_URL`** and **`WEB_BASE_URL`** only.

Secrets for local Docker and for optional `doppler run` flows should come from **[Doppler](https://docs.doppler.com/)** (same project/config as [start.sh](../start.sh) at the repo root).

## Environment variables

| Variable              | Purpose                                                                                                                         | Default (local)         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `API_BASE_URL`        | Demo Express API                                                                                                                | `http://127.0.0.1:4003` |
| `WEB_BASE_URL`        | Next.js app (browser tests)                                                                                                     | `http://127.0.0.1:3001` |
| `CI`                  | Set by CI runners                                                                                                               | —                       |
| `USE_DOCKER_SERVICES` | When `true`, Playwright does not start `webServer` (Compose already up)                                                         | —                       |
| `PW_START_API_SERVER` | When `true` (and not CI / not `USE_DOCKER_SERVICES`), Playwright starts the Node API from `../server/nodejs` for API tests only | —                       |
| `E2E_ACCESS_CODE`     | Optional. When set, UI **embedded-flow** tests run a real login (store in Doppler or export locally)                            | —                       |

Doppler should also define **`IRON_SESSION_PASSWORD`**, **`JWT_SECRET`**, **`COUNSEL_WEBHOOK_SECRET`**, and **`ACCESS_CODE_CONFIGS`** for Docker Compose (see [docker-compose.yml](../docker-compose.yml)).

## Doppler (local)

1. Install the [Doppler CLI](https://docs.doppler.com/docs/install-cli) and run **`doppler setup`** at the **repository root** (or copy [doppler.yaml.example](../doppler.yaml.example) to `doppler.yaml` and adjust `project` / `config`).
2. **Docker (same as CI):** from the repo root run **`./start.sh`**, which downloads secrets into `.env.local` and starts Compose
3. In another terminal, with containers up:
   ```bash
   cd automation-testing
   bun install
   bun run playwright:install
   CI=true USE_DOCKER_SERVICES=true bun run test:e2e
   ```
   To pass secrets from Doppler into the Playwright process (e.g. `E2E_ACCESS_CODE`), run:
   ```bash
   doppler run -- bun run test:e2e
   ```

## Run API tests only (no Docker)

The spawned server uses **`NODE_ENV=production`** so the in-memory DB does not run development seeding (which calls Counsel). Use Doppler so `JWT_SECRET`, `COUNSEL_WEBHOOK_SECRET`, and `ACCESS_CODE_CONFIGS` are set:

```bash
cd automation-testing
bun install
bun run playwright:install
doppler run -- env PW_START_API_SERVER=true bun run test:e2e:api
```

(Run from repo root if `doppler.yaml` lives there, or set `--project` / `--config` on `doppler run`.)

## CI (GitHub Actions)

The [ci-e2e](../.github/workflows/ci-e2e.yml) workflow uses **`dopplerhq/secrets-fetch-action@v1.3.1`** with **`inject-env-vars: true`**, and Blacksmith **`useblacksmith/stickydisk@v1`** for `automation-testing/node_modules` and **`~/.cache/ms-playwright`** (same pattern as counsel-main’s `ci.yml`). A final **`stickydisk-delete`** job releases those disks; **delete-key** strings must stay in sync with the mount **key** values in the workflow.

Configure the repository with:

- **Secret:** `DOPPLER_DEV_CI_TOKEN` — Doppler service token for the CI config (same pattern as counsel-self-hosted).
- **Variables:** `DOPPLER_PROJECT` and `DOPPLER_CONFIG` when your token requires explicit project/config (service account tokens).

Secrets injected by the action (including optional `E2E_ACCESS_CODE`) are available to the Playwright step without `doppler run`. Compose still uses a generated **`.env.local`** built from `IRON_SESSION_PASSWORD`, `JWT_SECRET`, `COUNSEL_WEBHOOK_SECRET`, and `ACCESS_CODE_CONFIGS`.

## Scripts

- **`bun run typecheck`** — `tsc --noEmit` for this package.

## Reports

HTML report: `bunx playwright show-report reports/html` after a run.
