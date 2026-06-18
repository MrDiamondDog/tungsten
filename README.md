# Tungsten

Tungsten is a fully self-hosted Obsidian alternative. It is served as a web app you can access from anywhere, including mobile. Your data is stored in a local sqlite database.

Built with Next. No AI used for any part of the project.

Built for Hack Club's [Stardance](https://stardance.hackclub.com)

## Features

- WYSIWYG Markdown editor
- File/folder organization
- Basic email/password authentication
- Links between files
- Tabbed editor (work on multiple files at once)
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
