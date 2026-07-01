# Tungsten

Tungsten is a fully self-hosted Obsidian alternative. It is served as a web app you can access from anywhere, including mobile. Your data is stored in a local sqlite database.

Built with Next. No AI used for creation of any assets or code.

![tungsten app preview](/public/app-preview.png)

Built for Hack Club's [Stardance](https://stardance.hackclub.com)

## Features

- WYSIWYG Markdown editor
- Links between files
- Math editing
- Images
- Custom emojis
- Template files
- Export files as HTML or Markdown
- Import Obsidian vaults
- Export individual folders or whole database
- Catppuccin themes
- Fast & simple!

## Stretch Goals

- Graph view
- Canvas

## Installation

Docker hasn't been set up yet. You'll have to build it from source.

- `pnpm i`
- `pnpm exec drizzle-kit push` - Create/init the database
- `pnpm build`
- `pnpm start`
