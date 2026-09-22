# First Choice Carpets: Cloudflare deployment

The existing six-page website is retained. Products and Gallery now read published records from Pages Functions, D1 stores their content, and a private R2 bucket stores uploaded images. `/admin/` manages the content. No WordPress installation, external CMS, browser API key, or ZIP is needed.

## 1. Project files and prerequisites

Work in the `FCC-website` folder containing `package.json`, `wrangler.toml`, and `functions/`. Install Node.js 22.13 or newer with npm (Node 24 recommended). Use a Cloudflare account with Pages, D1, R2, and Zero Trust enabled, and a custom domain managed through Cloudflare. R2 may require activating billing in the account.

The `dist/` directory is generated and contains public website files plus admin assets. The `functions/` directory is kept at the project root; Wrangler bundles it during deployment. Never publish the whole source folder as the static output. Old `wordpress/`, `wordpress-ready/`, `wordpress-content.html`, and Python conversion scripts are legacy files excluded from the build. Do not run the WordPress conversion scripts for this workflow.

The database initially contains eight categories and **no products or gallery items**. The old illustrative product cards and gallery images were not converted into real inventory. Add real content through the dashboard after deployment. Homepage inspiration and category sections remain part of the static design; this CMS manages the Products and Gallery pages only. The existing contact form's download behavior is unchanged; this is not a new email delivery service, checkout, or inventory system.

## 2. Create the Cloudflare resources

Use the dashboard steps below, or the optional CLI creation commands in section 6, but do not create duplicate resources.

1. In Cloudflare, open **Storage & databases → D1** and create `fcc-cms`. Copy its database UUID.
2. Create another D1 database named `fcc-cms-preview` for staging. Production and previews must not share data.
3. In **R2 Object Storage**, create `fcc-images` and `fcc-images-preview` buckets, using the standard storage class.
4. Leave both buckets private: do not enable an `r2.dev` public URL or connect an R2 custom domain. No bucket CORS policy or S3 access key is required. Functions access R2 through the `IMAGES` binding; browsers upload through authenticated same-origin APIs.
5. Open **Workers & Pages** and select your existing Pages project. For a new Git-connected project, choose Pages, connect the repository, select the production branch, use **Framework: None**, **Build command: `npm run build`**, and **Build output: `dist`**. Set the root directory to the folder containing this project's `package.json` (use `FCC-website` only if it is a subfolder of your repository). Use Node 24 for the build environment (`NODE_VERSION=24`).
6. Connect the canonical website hostname under the project's **Custom domains**, and complete the DNS verification. Choose one HTTPS hostname for admin, for example `https://www.your-domain.ca`.
7. Under the Pages project **Settings → Runtime → Fail open / closed**, select **Fail closed**. If Functions cannot run, the admin asset files must not fall through to static serving. See [Pages routing and failure settings](https://developers.cloudflare.com/pages/functions/routing/).

For a new direct-upload project, create the project with Wrangler in section 6 instead of connecting Git. Dashboard drag-and-drop uploads are not the deployment method for this project because it needs Functions compilation.

## 3. Configure Cloudflare Access before client use

1. Open **Zero Trust → Settings → Authentication**. Configure your identity provider, or enable One-time PIN for approved email sign-in. Prefer your identity provider's MFA for business accounts.
2. Find your Zero Trust team domain, in the form `https://YOUR-TEAM.cloudflareaccess.com`.
3. Open **Access → Applications → Add an application → Self-hosted**. Name it `First Choice CMS` and choose a session duration (for example, 8 hours).
4. In the same application, add public hostname/path entries for your canonical website domain covering `admin`, `admin/*`, `api/admin`, and `api/admin/*`. These are paths, not separate subdomains. Include both the bare paths and their descendants. Do not protect the entire public website or `/api/products`, `/api/gallery`, `/api/categories`, or `/media/*`.
5. Add an **Allow** policy with **Include → Emails**, entering each approved editor's exact email address. Do not use an Everyone or Bypass policy. Users who do not match an Allow policy remain denied.
6. Copy the application's **Application Audience (AUD) Tag** from its settings. Use this one audience for the dashboard and admin APIs by keeping all those paths in the same application. See [self-hosted applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/) and [application path rules](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/).
7. Set the same approved emails in `ADMIN_EMAILS` below. This server-side allowlist is checked in addition to the Access policy. All approved editors have the same editing permissions.
8. Repeat for staging with a separate Access application and audience, protecting a stable staging hostname. Do not reuse the production audience in preview settings.

The backend independently checks the Access JWT's RSA signature, issuer, audience, expiration and approved email. A caller cannot gain access just by adding an email header. It also rejects admin requests arriving on any hostname other than `PUBLIC_ORIGIN`. Write requests require a matching browser Origin and a custom header. No local authentication bypass is included. Reference: [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).

Use the canonical hostname to open admin. Admin on the default `project.pages.dev`, alternate `www`/apex hostname, and random preview URLs intentionally fails closed unless it is the configured origin. Keep Pages previews isolated; protect their admin paths too if you choose to enable their dashboard. Do not place an Access Bypass policy over these paths. Protecting only `/admin` while forgetting `/api/admin/*` is an incomplete Access configuration, even though backend JWT validation still blocks unauthorized writes.

## 4. Bindings and environment variables

Edit `wrangler.toml`. Replace every production placeholder and set `name` to your exact Pages project name. Configure the preview block with its separate resources before making preview deployments.

| Setting | Production value | Purpose |
| --- | --- | --- |
| `name` | Your Pages project name | Deployment target |
| `PUBLIC_ORIGIN` | `https://www.your-domain.ca` | Exact canonical origin, no path or trailing slash |
| `ACCESS_TEAM_DOMAIN` | `https://YOUR-TEAM.cloudflareaccess.com` | Access JWT issuer and signing-key endpoint, no trailing slash |
| `ACCESS_AUD` | Access Application Audience tag | Accepted application JWT audience |
| `ADMIN_EMAILS` | `owner@example.com,editor@example.com` | Comma-separated exact approved email addresses |
| D1 binding `DB` | `database_name="fcc-cms"`, real `database_id` UUID | Database accessed by all content APIs |
| R2 binding `IMAGES` | `bucket_name="fcc-images"` | Private image storage |

`env.preview` repeats these variables and bindings using the preview database, preview bucket, staging origin and staging Access audience. Binding names stay exactly `DB` and `IMAGES` in both environments. The D1 migrations directory is `migrations`.

These configuration values are not passwords and are not included in the static build. Do not put an Access service-token secret, Cloudflare API token, R2 S3 key, or database credential in frontend JavaScript. There is no CMS password environment variable. Wrangler login handles the developer's deployment authorization.

The checked-in Wrangler configuration is the source of truth for runtime settings. After deployment, inspect **Pages → Settings → Bindings** and **Variables and Secrets** to confirm `DB`, `IMAGES`, and the four variables reached the right environment. Do not maintain conflicting dashboard and file values. If adapting an existing project that was configured only through the dashboard, copy its correct IDs into this file first. See [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) and [bindings](https://developers.cloudflare.com/pages/functions/bindings/).

## 5. Database and R2 configuration

The schema is `migrations/0001_initial.sql`:

- `categories`: seeded category IDs, labels, slugs and display order.
- `products`: UUID, category foreign key, name, plain-text description, optional integer CAD cents, price unit, featured/published flags, image reference, accessible image description, version and timestamps.
- `gallery`: UUID, title, description, image reference, accessible description, display order, published flag, version and timestamps.
- `media`: UUID, unique R2 object key, MIME type, size, filename and creation time.

Prices are stored in cents to avoid rounding drift, and blank prices are `NULL`. Products may omit an image; gallery items require one. Foreign keys prevent deleting images still referenced by any product or gallery item, including drafts. Version numbers prevent stale edits overwriting newer changes.

Categories are preconfigured to match the existing navigation. Editors choose categories; category creation/renaming is not part of this dashboard. To add categories later, use a new SQL migration and update the shared navigation links. Do not modify an already-applied migration.

R2 images use keys `uploads/<UUID>.jpg`, `.png`, or `.webp`. The dashboard resizes uploads to a maximum 2400-pixel edge and re-encodes them, removing original metadata. It accepts source images up to 20 MB. The API accepts only JPEG/PNG/WebP with matching signatures and MIME types, with a hard 5 MB stored-upload limit. SVG is rejected. Signature checking is not a full image decoder or antivirus scan. The private bucket is accessed only by Functions. No public bucket URL is needed; public image URLs are `/media/<UUID>`. Those URLs work only while a published product or gallery item references the image. Already downloaded copies cannot be revoked.

## 6. Exact deployment steps

Open PowerShell in this project's `FCC-website` folder. Install Node with npm first if `npm` is not recognized.

```powershell
npm install
npx wrangler login
```

Keep the generated `package-lock.json` in version control so future installs use the same dependency versions. On subsequent installs/CI use `npm ci`.

If you have **not** created the storage resources in the dashboard, create them now:

```powershell
npx wrangler d1 create fcc-cms
npx wrangler d1 create fcc-cms-preview
npx wrangler r2 bucket create fcc-images
npx wrangler r2 bucket create fcc-images-preview
```

Copy the returned IDs into `wrangler.toml`, complete section 4's production and preview values, and set the project name. To create a **new direct-upload** Pages project (skip this command for an existing project):

```powershell
npx wrangler pages project create fcc-website --production-branch main
```

Replace `fcc-website` with the same project name in `wrangler.toml`. For an existing Pages project, use its actual production branch in place of `main` below.

Apply the schema, run checks, build, and deploy production:

```powershell
npx wrangler d1 migrations apply DB --remote
npm test
npm run build
npx wrangler pages deploy dist --project-name fcc-website --branch main
```

Run deployment from the project root, where `functions/` lives. Do not run it from inside `dist/`. Wrangler uploads static assets and compiles the Pages Functions together. Migrations are a separate explicit step; deploying HTML does not create the database tables.

For a Git-connected Pages project, the dashboard's `npm run build` and `dist` settings handle builds/deploys after you push. Apply the remote migrations from your terminal before deploying code that needs them. Do not configure a second competing automatic deploy process.

Optional isolated staging:

```powershell
npx wrangler d1 migrations apply DB --remote --env preview
npm run build
npx wrangler pages deploy dist --project-name fcc-website --branch staging
```

Nonproduction branch deployments use the preview configuration. Set its `PUBLIC_ORIGIN` to your stable staging hostname (and configure DNS/Pages alias and Access for it). A random per-deployment URL is not an approved admin origin. Do not point staging at production storage just to bypass setup.

For local public-page development:

```powershell
npx wrangler d1 migrations apply DB --local
npm run dev
```

This uses local simulated D1/R2; it does not populate the production database. Public lists initially appear empty. Local admin intentionally rejects requests because Cloudflare Access is not running on localhost; use protected staging for end-to-end dashboard testing. Do not add a development auth bypass to production. The automated tests generate signed test tokens in memory; their private key is never deployed.

## 7. Verify before handing over

1. Open the public website signed out. Its design and navigation should load normally. Products and Gallery should show an empty state until content is published.
2. In a private browser window, visit `/admin/`, `/admin/admin.js` and `/api/admin/products`. They should trigger Access sign-in or deny access; none should expose private records.
3. Sign in as an approved editor on the canonical domain. Add a draft product, upload an image, provide alt text, and save. Confirm both the draft product and its `/media/<id>` URL are unavailable signed out.
4. Publish it, verify the product card, image, category filtering, search, price, featured ordering and mobile layout. Edit it and verify changes appear after refreshing the public page.
5. Add a gallery item, confirm its image/caption/order, then unpublish it and confirm it disappears. If the same image is still used by another published item, its public URL remains available as intended.
6. Open one item in two browser tabs. Save the first, then the second. The second save should report a conflict. Cancel, refresh, and reopen to get the latest version.
7. Verify image deletion is disabled while referenced. Delete an unused image and confirm its URL no longer works.
8. Try an unapproved account and an alternate Pages hostname. They must not allow admin use. Check missing or expired sessions cannot modify records.
9. Test at a phone width, with keyboard navigation, and with a disconnected network; forms should retain unsaved edits after errors. If a network interruption happens during a save, refresh the list before retrying an Add action to avoid creating a duplicate after an uncertain successful request.

Do not configure Cache Everything for `/api/*`, `/media/*`, or `/admin*`. These routes return `Cache-Control: no-store` so publication changes and private responses are not cached. A successful upload followed by cancelling the editor leaves an unused image; remove it from Images when no longer needed.

## 8. API routes

Every response is JSON except image files, Access redirects and dashboard assets. Error JSON is `{ "error": "Human-readable message" }`. Public endpoints expose only published items. IDs are UUIDs. No public write endpoint exists.

| Method | Path | Access / purpose |
| --- | --- | --- |
| GET | `/api/categories` | Public seeded categories |
| GET | `/api/products` | Public products; `q`, `category` slug, `featured=1`, `sort=featured\|az\|za`, `page`, `limit` |
| GET | `/api/products/:id` | Public single published product |
| GET | `/api/gallery` | Public gallery; `q`, `page`, `limit`; ordered by `sort_order` |
| GET | `/api/gallery/:id` | Public single published gallery item |
| GET, HEAD | `/media/:id` | Public image only if used by published content |
| GET | `/api/admin/session` | Verified editor identity |
| GET | `/api/admin/categories` | Categories for editor dropdown |
| GET | `/api/admin/products`, `/api/admin/gallery` | All records including drafts; same list filters |
| GET | `/api/admin/products/:id`, `/api/admin/gallery/:id` | Full editable record and version |
| POST | `/api/admin/products`, `/api/admin/gallery` | Create record |
| PUT | `/api/admin/products/:id`, `/api/admin/gallery/:id` | Replace editable fields; current `version` required |
| DELETE | `/api/admin/products/:id`, `/api/admin/gallery/:id` | Delete record; JSON body `{ "version": 1 }` |
| POST | `/api/admin/media` | Raw image bytes, matching image Content-Type; optional `X-File-Name` |
| GET | `/api/admin/media` | Paginated media library with reference counts |
| GET, HEAD | `/api/admin/media/:id/file` | Private image preview, including drafts/unattached images |
| DELETE | `/api/admin/media/:id` | Delete unused image from D1 and R2; referenced images return 409 |
| GET, HEAD | `/admin`, `/admin/*` | Protected dashboard and its assets |

All `/api/admin/*` and dashboard routes require a verified Access JWT. Mutation requests also require `Origin: <PUBLIC_ORIGIN>` and `X-FCC-Admin: 1`. Browsers provide Origin; the admin script provides the custom header. JSON mutation bodies require `Content-Type: application/json` and have a 24 KB limit. Uploads use raw bytes, not multipart form data. No cross-origin modification access is enabled.

List response shape: `{ "items": [], "total": 0, "page": 1, "limit": 12 }`. `limit` is 1–50. Create/update responses contain `{ "item": { ... } }`, with `201` for creates. Common errors: 400 validation, 401 invalid/missing session, 403 forbidden identity/origin, 404 missing or unpublished content, 409 edit conflict/image in use, 413 too large, 415 unsupported media, 503 unavailable configuration/service.

Product create body (image optional; use an uploaded UUID when present):

```json
{
  "name": "Natural Oak",
  "category_id": "engineered-hardwood",
  "description": "Enter the real product description here.",
  "price_cents": 599,
  "price_unit": "per sq. ft.",
  "featured": true,
  "published": false,
  "image_id": null,
  "image_alt": ""
}
```

For PUT, include every editable field plus the returned `version`. A gallery body uses `title`, `description`, `image_id`, `image_alt`, `sort_order` (0–9999) and `published`. Price units are `""`, `"per sq. ft."`, `"per item"`, or `"per box"`. Plain-text inputs are normalized, length-limited and reject markup/control characters; the UI uses text nodes, never inserted HTML. SQL values use bound parameters.

## 9. Maintenance, backups and troubleshooting

- Back up D1 before schema changes: `npx wrangler d1 export DB --remote --output=backup.sql`. Store the backup privately outside `dist/`. Also back up the R2 bucket through your chosen R2-compatible backup tool; a database export does not contain images.
- Do not add an R2 lifecycle rule that expires active uploads. Deleting/replacing a product image does not automatically delete the former image, because images may be shared. Use the Images tab for cleanup.
- D1 and R2 are separate services, so their changes are not one transaction. An R2 failure during image deletion can leave a private orphan object after its database row is removed; an interrupted upload can also leave an orphan. Check Functions logs and compare R2 keys with `media.object_key` before manually removing orphans. Never delete an object still referenced by the media table.
- `Admin access has not been configured`: replace the Access/origin/email placeholders, then redeploy. `Open admin on the configured website domain`: use the canonical hostname. Session errors: confirm audience, team URL, allowlist and Access paths, then sign in again.
- Empty lists after deployment: publish real items; the schema intentionally does not seed sample stock. `Service unavailable`: verify both bindings and apply migrations to the correct database. Review Pages Functions logs; no credentials or request bodies are deliberately logged by this code.
- To revoke an editor, remove them from the Access policy and `ADMIN_EMAILS`, redeploy the variable change, and revoke their active Access sessions.
- Monitor D1/R2/Functions usage in Cloudflare. Add appropriate account-level rate limits for admin uploads if needed; this project does not implement user quotas or an audit-history UI.

## 10. Verification scope

The included Node integration tests run the real API/auth code against SQLite and an in-memory R2 adapter, using real RSA-signed test tokens. They cover authorization, public write rejection, CRUD, validation, drafts, query filtering, optimistic concurrency, uploads, image privacy and reference protection. Run `npm test`; in a process-restricted environment use `node --test --test-isolation=none tests/cms.test.mjs`.

The static build has been generated locally and four test groups pass. npm/Wrangler was not available in the editing environment, so Wrangler's Functions compilation was not run here. These checks do not replace the staging checklist: a live Cloudflare deployment, actual D1/R2 bindings, Access login redirects, and browser/mobile rendering must be verified after your account setup. No Cloudflare resources or deployments were created by this task.
