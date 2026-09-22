# First Choice Carpets — Cloudflare website and CMS

The existing HTML/CSS/JS website now uses Cloudflare Pages Functions, D1 and R2 for a private product/gallery dashboard at `/admin/`. Its burgundy design, separate pages and product navigation are retained.

## Start here

- [Cloudflare setup, bindings, migrations, deployment and API reference](docs/CLOUDFLARE_SETUP.md)
- [Client dashboard instructions](docs/CLIENT_GUIDE.md)
- [Database schema and category seeds](migrations/0001_initial.sql)
- [D1, R2 and Access configuration](wrangler.toml)

Install Node.js with npm, configure your Cloudflare resources and Access application using the setup guide, replace `wrangler.toml` placeholders, then:

```powershell
npm install
npx wrangler login
npx wrangler d1 migrations apply DB --remote
npm test
npm run build
npx wrangler pages deploy dist --project-name fcc-website --branch main
```

Use your actual project name and production branch. Deploy from this directory, not from inside `dist`. Wrangler compiles `functions/` alongside the generated static output. Account setup and deployment have not been performed for you.

## Layout

- Existing six HTML pages, `styles.css`, `navigation.js`, `script.js`, `assets/`: public design.
- `catalogue.js`, `gallery.js`: dynamic public catalogue/gallery with loading, empty and failure states.
- `admin/`: responsive authenticated content editor, upload optimization and unused-image cleanup.
- `functions/`, `server/`: API routing, verified Access JWTs, validation, parameterized D1 queries and private R2 handling.
- `migrations/`: database schema. Start with empty product/gallery lists and add real content through admin.
- `tools/build.mjs`: rebuilds `dist/` from an allowlist; does not publish source/configuration/secrets.
- `tests/cms.test.mjs`: API integration/security tests with SQLite, simulated R2 and real test JWT signatures.

CMS content changes appear without redeploying. Categories are seeded to match navigation; changing the category set, static pages or staff access remains a developer task. Product prices are optional CAD values, and this is an enquiry catalogue rather than a checkout.

The existing contact form is still its original demonstration/download form; no email delivery backend was added. Homepage content remains static. Legacy WordPress folders/scripts are retained but are excluded from the build and are no longer the active workflow.

Run `npm test`, or `node --test --test-isolation=none tests/cms.test.mjs` when subprocess execution is restricted. Build directly with `node tools/build.mjs` if only Node is available. The live Cloudflare and browser acceptance checklist is in the setup guide.

This `FCC-website` directory remains the working copy. Do not create ZIP archives until the owner confirms the project is complete.
