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

You can include a subpath after the service name:

```text
https://your-gateway.example/my-render-service/dashboard
```

This targets `https://my-render-service.onrender.com/dashboard`.

Append a theme name as a bare query parameter to choose its animation:

```text
https://your-gateway.example/my-render-service?coffee
```

Available themes: `factory`, `bakery`, `space`, `garden`, `coffee`, and `arcade`.

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

The route `/:name/:subpath` validates the service name, constructs `https://<name>.onrender.com/<subpath>`, sends a browser request, and redirects to the service when that request completes. The subpath is optional. Because the request uses `no-cors`, the page cannot inspect the service's HTTP status or response body.

## Tech stack

- Vue 3
- TypeScript
- Vite
- Tailwind CSS and Sass
- Cloudflare Pages

## License

[MIT](LICENSE.md)
