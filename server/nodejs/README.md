# Example Counsel Node.js Server

A simple HTTP server built with Node.js, Express, and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

## Development

To run the server in development mode with hot reloading:
```bash
npm run dev
```

## Secret Management

The server uses [Doppler](https://docs.doppler.com/) to manage secrets. This makes it easy to manage secrets for different environments and to keep them private. 

You can remove the doppler dependency and set custom environment variables in the `.env.local` file.
Just change the `dev` script in `package.json` to:
```json
"dev": "NODE_ENV=development tsx watch src/index.ts",
```

To get started, run:

```bash
doppler setup
```



## Simulate Production locally

Ideally, run this server with Docker.
```bash
cd ../.. # Go to the root directory of the project
docker compose up
```

The server will be available at http://localhost:4003

## Available Endpoints

- `GET /`: Welcome message
- `GET /health`: Health check endpoint
- `POST /user/signUp`: Sign up a new user using an access code and returns a JWT session
- `POST /user/signOut`: Sign out a user (requires a valid JWT session passed in the Authorization header)
- `POST /user/signedAppUrl`: Gets the signed app url for the user (requires a valid JWT session passed in the Authorization header)
- `POST /onCounselWebhook`: Handles Counsel webhooks (requires a valid API key passed in the Authorization header)

## Environment Variables

- `PORT`: The port to run the server on
- `JWT_SECRET`: The JWT secret for the Demo Server
- `COUNSEL_WEBHOOK_SECRET`: The secret for the counsel webhooks
- `ACCESS_CODE_CONFIGS`: A JSON string mapping access codes to their configurations. Format:
  ```json
  {
    "ACCESS_CODE_CONFIGS": {
      "client": "embedded-counsel-1",
      "apiUrl": "https://test-api.counselhealth.com",
      "apiKey": "your-api-key",
      "userType": "main"
    },
    "ONBR01": {
      "client": "embedded-counsel-2",
      "apiUrl": "https://test-api.counselhealth.com",
      "apiKey": "your-onboarding-api-key",
      "userType": "onboarding"
    }
  }
  ```
  
  Each access code configuration must include:
  - `client`: The client identifier
  - `apiUrl`: The full URL of the Counsel API endpoint
  - `apiKey`: The API key for that specific access code
  - `userType`: Either "main" or "onboarding" (defaults to "main" if not provided)

## Database

The database is a simple SQLite database that is created in memory.

## Seeds

The database is seeded with a user when the server is started. We currently create a single demo user with the following details:

- ID: 1
 - Name: John Doe


## Deploying to Cloud Run

The server is deployed to Cloud Run using the `cd-server.yml` workflow in the `.github/workflows` directory.
The workflow builds the Docker image and pushes it to Google Artifact Registry.
It then deploys the container image to Cloud Run.

#### To deploy manually, you can use the following commands:

```bash
gcloud auth configure-docker us-east1-docker.pkg.dev
docker build -t "us-east1-docker.pkg.dev/${PROJECT_ID}/embedded-demo/embedded-demo-nodejs-server:latest" --platform linux/amd64 ./
docker push "us-east1-docker.pkg.dev/${PROJECT_ID}/embedded-demo/embedded-demo-nodejs-server:latest"

gcloud run deploy embedded-demo-nodejs-server --image=us-east1-docker.pkg.dev/${PROJECT_ID}/embedded-demo/embedded-demo-nodejs-server:latest --project=${PROJECT_ID} --region=us-east1 --allow-unauthenticated --port=4003 --set-env-vars <all-env-vars>
```


## Webhooks

The server listens for webhooks from Counsel.

The webhook endpoint is `POST /onCounselWebhook`.

The webhook secret is stored in the environment variable `COUNSEL_WEBHOOK_SECRET`.

Endpoints are registered using the Counsel API - see `https://sandbox-api.counselhealth.com/docs`


