# Example Counsel Node.js Server

A simple HTTP server built with Node.js and TypeScript.

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

## Production

To build and run the server:
```bash
npm run build
npm start
```

The server will be available at http://localhost:4003

## Available Endpoints

- `GET /`: Welcome message
- `GET /chat/signedAppUrl`: Get the signed app url for the user

## Environment Variables

- `PORT`: The port to run the server on
- `COUNSEL_API_KEY`: The API key for the Example Counsel API

## Database

The database is a simple SQLite database that is created in memory.

## Seeds

The database is seeded with a user when the server is started. We currently create a single demo user with the following details:

- ID: 1
- Name: John Doe
