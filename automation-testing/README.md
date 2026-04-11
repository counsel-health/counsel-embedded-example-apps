# Automation (API + UI)

Playwright tests for the demo **Node server** (`server/nodejs`) and **Next.js** app (`web/nextjs`). The suite does not import those packages; it targets them via **`API_BASE_URL`** and **`WEB_BASE_URL`**.

Use **[Doppler](https://docs.doppler.com/)** for secrets (same project/config as [start.sh](../start.sh) at the repo root).

## Quick start (Docker + Doppler)

1. [Install the Doppler CLI](https://docs.doppler.com/docs/install-cli) and run **`doppler setup`** at the **repo root** (or copy [doppler.yaml.example](../doppler.yaml.example) to `doppler.yaml`).
2. From the repo root: **`./start.sh`** (writes `.env.local` and starts Compose).
3. In another terminal:

```bash
cd automation-testing
bun install
bun run playwright:install
bun run test:e2e
```

`test:e2e` uses **`doppler run`**, so secrets like **`E2E_ACCESS_CODE`** and **`E2E_ACCESS_CODE_INTEGRATED`** reach Playwright. Doppler finds **`doppler.yaml`** in a parent directory.

## Other local runs

Start the **API** and **web** yourself (e.g. repo root **`./start.sh`**, or **`docker compose up`**, or run **`server/nodejs`** and **`web/nextjs`** dev servers on the URLs in **`API_BASE_URL`** / **`WEB_BASE_URL`**). For API-only runs you still need a reachable server with valid `JWT_SECRET`, `COUNSEL_WEBHOOK_SECRET`, and `ACCESS_CODE_CONFIGS` (via Doppler or env).

```bash
cd automation-testing
bun install && bun run playwright:install
bun run test:e2e:api   # or test:e2e:ui / test:e2e
```

## Environment

| Variable          | Role                                   | Default                 |
| ----------------- | -------------------------------------- | ----------------------- |
| `API_BASE_URL`    | Express API (must already be running)  | `http://127.0.0.1:4003` |
| `WEB_BASE_URL`    | Next.js (must already be running)      | `http://127.0.0.1:3001` |
| `CI`              | Set by CI (workers, retries, headless) | —                       |
| `HEADLESS`        | `true` → headless browser (local UI)   | —                       |
| `E2E_ACCESS_CODE` | Required for embedded-flow login test  | —                       |
| `E2E_ACCESS_CODE_INTEGRATED` | Optional; access code with `navMode: integrated` for [integrated-handoff](ui/integrated-handoff.spec.ts). If unset, falls back to `E2E_ACCESS_CODE` (CI) then `AICHAT` | — |

## CI

Workflow: [.github/workflows/ci-e2e.yml](../.github/workflows/ci-e2e.yml). It fetches secrets with **`dopplerhq/secrets-fetch-action`** (**`inject-env-vars: true`** puts them on the job environment). **`docker compose up`** starts the stack; Compose resolves **`${VAR}`** in [docker-compose.yml](../docker-compose.yml) from that environment first (so web/server containers receive Doppler values). Playwright (**`test:e2e:ci`**) only runs tests against those URLs and sees the same job env (e.g. **`E2E_ACCESS_CODE`**, **`E2E_ACCESS_CODE_INTEGRATED`**). Blacksmith **stickydisk** caches `automation-testing/node_modules` and `~/.cache/ms-playwright`; the cleanup job’s **delete-key** values must match the mount keys in the workflow.

**Repo settings:** secret **`DOPPLER_CI_TOKEN`**; variables **`DOPPLER_PROJECT`** and **`DOPPLER_CONFIG`** if your token needs them.

**Reproduce CI locally** (Compose on 3001 / 4003, from repo root):

```bash
docker compose up --build -d
cd automation-testing
bun run playwright:install:ci
bun run test:e2e:ci
```

With Doppler in the shell, exported secrets override for the same variable names. Without Doppler, UI tests that need a real access code still require **`E2E_ACCESS_CODE`** (e.g. `export E2E_ACCESS_CODE=...` before **`bun run test:e2e:ci`**).

The **`:ci`** scripts use inline `VAR=value` (Unix-friendly). On Windows, use Git Bash, WSL, or set the same variables yourself.

## Scripts

| Script                                             | What it does                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `test:e2e`, `test:e2e:api`, `test:e2e:ui`          | `doppler run` + Playwright.                                                  |
| `test:e2e:ci`, `test:e2e:api:ci`, `test:e2e:ui:ci` | CI-style env and Compose URLs; no `doppler run`.                             |
| `playwright:install` / `playwright:install:ci`     | Chromium locally / with `--with-deps` (CI).                                  |
| `lint` / `format` / `format:check`                 | **oxlint** / **oxfmt** (same toolchain as `server/nodejs` and `web/nextjs`). |
| `typecheck`                                        | `tsc --noEmit`.                                                              |

## Reports

After a run: **`bunx playwright show-report reports/html`**.
