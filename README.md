# The Reading Room

My personal bookshelf: the books I've read and the ones I'm reading now, shown on an interactive 3D shelf.

Built with React, Vite, Three.js and Tailwind CSS.

## Run

```sh
pnpm install
pnpm dev
```

## Add a book

1. Put the cover (and spine, if you have one) in `public/books/`.
2. Add an entry to `src/data/books.ts`.

No spine image? The shelf draws one from `color` and `foil`.

## Edit your details

Name, bio and links are in `src/data/profile.ts`.

## Build

```sh
pnpm build
```
