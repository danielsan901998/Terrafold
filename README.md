# Terrafold

A TypeScript version of Terrafold.

## Development Workflow

### Prerequisites
- [Bun](https://bun.sh) installed.

### Installation
```bash
bun install
```

### Run Locally
```bash
bun run start
```
This will build the assets and start a server at `http://localhost:8000`.

### Build
To build the assets without starting a server:
```bash
bun run build
```
The output will be in `public/dist`.

### Testing
Run all tests:
```bash
bun test
```

Run unit tests only:
```bash
bun run unit-test
```

Run integration (e2e) tests only:
```bash
bun run integration-test
```

## Deployment

### GitHub Actions
This project is configured with a GitHub Actions workflow that automatically:
1. Runs unit and integration tests on every push and pull request.
2. Deploys the game to GitHub Pages when changes are pushed to the `main` branch.

The deployment serves the contents of the `public/` directory.

### Manual Deployment
1. Run `bun run build`.
2. Upload the contents of the `public/` directory to your static hosting provider.
