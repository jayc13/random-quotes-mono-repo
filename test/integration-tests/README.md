# Integration Tests

This project contains integration tests for the Random Quotes API, testing endpoints and authentication flows.

## Setup

1. Install dependencies:

```bash
    npm install
```

2. Configure environment variables by copying the example `.env` file:

```bash
    cp .env.example .env
```

Required environment variables:

- `ADMIN_USER_EMAIL` - Admin user email for authentication
- `ADMIN_USER_PASSWORD` - Admin user password
- `REGULAR_USER_EMAIL` - Regular user email for authentication
- `REGULAR_USER_PASSWORD` - Regular user password
- `AUTH0_CLIENT_SECRET` - Auth0 client secret
- `AUTH0_CLIENT_ID` - Auth0 client ID
- `AUTH0_DOMAIN` - Auth0 domain
- `API_BASE_URL` - Base URL for the API (default: http://localhost:8787)

## Running Tests

Run all integration tests:

```bash
    npm test
```

## Dependencies

- Mocha - Test runner
- Chai - Assertion library
- SuperTest - HTTP testing
- TypeScript - Language

```