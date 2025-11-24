Mini Story SDK - TypeScript Web Component
========================================

Project layout (generated):
- src/mini-story.ts       TypeScript source (Web Component)
- src/index.ts           Public exports
- demo/index.html        Professional demo page (uses dist/esm/index.js)
- rollup.config.js       Rollup config to produce ESM + CJS + types
- tsconfig.json
- package.json

Quick start (locally)
1. npm install
2. npm run build
   - This runs tsc to emit JS under dist/tsc, then Rollup to produce:
     - dist/esm/index.js (ES module)
     - dist/cjs/index.js (CommonJS)
     - dist/types/index.d.ts (Type declarations)
3. Open demo/index.html in a static server (e.g. `npx http-server demo` or serve via VSCode Live Server).
   Note: demo uses dist/esm/index.js; ensure you build first.

Notes:
- I have included the TypeScript source and standard build scripts. You need to run `npm install` to fetch Rollup and TypeScript.
- For publishing, bump version in package.json and `npm publish` (or use GitHub Packages).

Attached CV path (as requested): /mnt/data/cv.pdf