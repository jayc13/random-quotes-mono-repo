# Server

Backend server application for random quotes project.

## Prerequisites

- Node.js v23
- npm

- D1 (Cloudflare database)

## Setup

1. Install dependencies:

```bash
	npm install
```

2. Configure environment variables:

Create a `.env` file in the root directory with the following variables:

```
AUTH0_DOMAIN=""
AUTH0_CLIENT_ID=""
```

## Available Scripts

- **Build**: Compile TypeScript code

```bash
npm run build
```

- **Start**: Run the server

```bash
npm run start
```

- **Test**: Run unit tests

```bash
npm test
```

## Related Projects

- `client/admin` - Admin interface frontend
- `test/integration-tests` - Integration test suite
