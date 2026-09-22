# Hydroxios

Personal website for Hydroxios, built with Next.js. The site highlights Minecraft mods/plugins, Discord bots, and social links.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Pages

- `/` - Home page with project links and social links.
- `/minecraft` - Mods, plugins and packs. Demo entries are labeled and cannot be downloaded.
- `/discord` - Discord bot catalog with invitation links.
- `/dashboard` - Private catalog editor with Discord authentication. See [dashboard setup](DASHBOARD.md).

## Project Structure

```txt
app/
  page.tsx                 Home page
  layout.tsx               Root layout and metadata
  globals.css              Global styles and Tailwind import
  dashboard/              Private catalog editor
  discord/page.tsx         Discord bots page
  minecraft/page.tsx       Minecraft projects page
  types/index.ts           Shared TypeScript types
public/
  *.svg                    Social and UI icons
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev
```

Starts the local development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server after building.

```bash
npm run lint
```

Runs ESLint.

Run `npm test` for unit tests. After `npm run build`, run `npm run test:dashboard` to check authentication and catalog writes against a disposable server and temporary data.

```bash
npm run pack:info -- "path/to/pack.zip"
```

Prints the file's SHA256 and size in bytes as JSON. Copy the `sha256` and `size` values into the pack's `archive` object in `data/packs.json`. Files are streamed so large archives do not have to fit in memory.

## Managing catalogs

Edit `data/minecraft.json`, `data/discord.json`, and `data/packs.json`. Pages and API routes use the same runtime validator. IDs must be unique lowercase slugs within each catalog. Every item needs an `id` and `name`; Minecraft projects and packs also require `version`, `minecraft`, and `loader` (`type` and `version`). Add an optional `description` to describe the resource.

Minecraft entries require `type: "mod"` or `"plugin"` and may have a HTTP(S) `download` URL. Bots may have an invitation `url` and an optional `version`; unknown versions should be omitted.

Packs require an `archive.url`. Real packs also require a 64-character hexadecimal `archive.sha256` and a positive integer `archive.size` in bytes. Run `npm run pack:info -- "path/to/archive.zip"` to compute these values from the actual archive. Set `demo: true` for placeholder packs or fictional Minecraft entries: their download buttons remain unavailable. Remove this flag only when real content is ready. APIs expose the demo flag too, so external consumers must honor it. The original HxPack placeholder is preserved in `data/drafts/packs.json`, which is not read by the application.

Catalog pages read files on each request. Invalid data returns an API error and prevents rendering misleading content. Test catalog changes with `npm test` (Node.js 22.18+), then `npm run lint` and `npm run build`.
`icon` accepts a HTTP(S) URL pointing to a PNG (query parameters allowed). Leave it empty or omit it to use the built-in SVG fallback. An image loading error also switches to that fallback.
