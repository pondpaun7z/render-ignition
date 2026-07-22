# Render Ignition

A small gateway page that sends a wake-up request to a Render service before redirecting the visitor to it. It is designed for services that may need time to start after being idle.

## Usage

Append your Render service name to the deployed URL:

```text
https://your-gateway.example/my-render-service
```

This targets:

```text
https://my-render-service.onrender.com/
```

Only a single valid Render service name is accepted. Invalid or nested paths are rejected.

## Development

Requirements: [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm test           # Run the Node.js tests
pnpm build          # Type-check and build for production
pnpm preview        # Preview the production build locally
pnpm preview:pages  # Build and preview with Cloudflare Pages
```

## Deployment

### Cloudflare Pages

Connect the repository with these build settings:

- Build command: `pnpm build`
- Build output directory: `dist`
- Root directory: `/`

Or deploy from the command line after authenticating Wrangler:

```bash
pnpm deploy
```

## How it works

The route `/:name` validates the path, constructs `https://<name>.onrender.com/`, sends a browser request, and redirects to the service when that request completes. Because the request uses `no-cors`, the page cannot inspect the service's HTTP status or response body.

## Tech stack

- Vue 3
- TypeScript
- Vite
- Tailwind CSS and Sass
- Cloudflare Pages

## License

[MIT](LICENSE.md)
