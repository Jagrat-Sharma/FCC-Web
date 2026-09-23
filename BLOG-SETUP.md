# Blog deployment and use

Before deploying this update, run from the project folder:

```powershell
npx wrangler d1 migrations apply fcc-cms --remote
node tools/build.mjs
node --test --test-isolation=none tests/cms.test.mjs
```

The additive `0003_blog.sql` migration creates the blog table and indexes. Existing data stays intact. Apply pending migrations before pushing the new code to GitHub so the Pages deployment does not run against an older schema. No new bindings or Access configuration are required.

In `/admin/`, choose **Manage blog**, then **Add blog post**. Enter a title, a short summary in Description, and Article text (plain text, paragraphs separated by a blank line). Optionally upload a cover image and supply its accessible description. Turn **Display on website** on to publish, or leave it off for a draft. Save changes. Existing posts have Edit and Delete controls; deletion asks for confirmation. Images referenced by a post cannot be deleted until detached or the post is deleted.

The footer's Learning centre group links to `blog.html`. Individual articles use `blog.html?id=POST_ID`; only published posts are returned publicly. The listing is paginated. There are no invented sample articles. The site header has no Blog link.

Routes: public `GET /api/blogs` and `GET /api/blogs/:id`; protected `GET/POST /api/admin/blogs` and `GET/PUT/DELETE /api/admin/blogs/:id`. Existing R2 media routes support blog covers and enforce draft visibility. Articles render as plain text, not HTML. Blog content currently loads with JavaScript, like the existing catalogue.

All displayed address blocks link to Google Maps in a new tab. Footer navigation contains only working site destinations.
