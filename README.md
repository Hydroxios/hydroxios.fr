# Hydroxios

Personal website for Hydroxios, built with Next.js. The site highlights Minecraft mods/plugins, Discord bots, and social links.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Pages

- `/` - Home page with the Hydroxios hero, project links, and social links.
- `/minecraft` - Placeholder page for Minecraft mods, plugins, and tools.
- `/discord-bots` - Placeholder page for Discord bots and automations.

## Project Structure

```txt
app/
  page.tsx                 Home page
  layout.tsx               Root layout and metadata
  globals.css              Global styles and Tailwind import
  components/Title.tsx     Animated Hydroxios title
  discord-bots/page.tsx    Discord bots page
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

```bash
npm run pack:info -- "path/to/pack.zip"
```

Prints the file's SHA256 and size in bytes as JSON. Copy the `sha256` and `size` values into the pack's `archive` object in `data/packs.json`. Files are streamed so large archives do not have to fit in memory.
