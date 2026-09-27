# Catalogue images and image links

## Deploy this update

1. Commit and push these changes using the existing GitHub deployment workflow; wait for the Pages deployment to succeed.
2. From the FCC-website directory, apply pending migrations:

```powershell
npx wrangler d1 migrations apply fcc-cms --remote
```

Migration 0009 adds 269 verified manufacturer image references to the existing imported products. It preserves uploaded images, existing external images, product edits and visibility. Running it again does not duplicate data. The new batch has 305 images across 343 colour choices; the 38 remaining gaps are listed in CATALOGUE-BATCH-1.md. Existing Beaulieu images remain unchanged.

No new Cloudflare bindings, secrets or bucket settings are required. The existing DB and IMAGES bindings are used. Nothing was deployed or applied to the remote database during this change.

## Add an image in admin

1. Open Add product and choose its category, or edit an existing product, gallery item or blog post.
2. Paste a direct image URL in **Image link** and click **Add image from link**.
3. Wait for the preview and success message, then save the item.
4. For individual colours, use **Swatch image link** and **Add swatch from link** under that colour, then save the product.
5. Use **Display on website** on the overview to publish when ready.

The URL must point directly to JPEG, PNG or WebP image data, not a product webpage. Imports accept files up to 5 MB. Existing file uploads are still available. If a manufacturer blocks downloads or its host is unsupported, download the image yourself and use Upload instead. Overview cards use the first available swatch when no main image is selected.

## Storage and access

`POST /api/admin/media/import` accepts JSON `{ "url": "https://..." }`. It requires the same approved Cloudflare Access identity, origin and admin header as other modification routes. It downloads the image once into R2, creates a D1 media record and returns the media item. Save attaches it to the product/gallery/blog; imported files stay private until a published item references them. Unattached imports can be removed from the image library.

HTTPS only; exact approved public hosts only; credentials and custom ports are rejected. Redirect destinations are rechecked, with three redirects maximum. Downloads have a 15-second timeout, a 5 MB body limit and image signature/type checks. SVG and HTML are rejected. Authentication cookies and Access tokens are never forwarded to image hosts.

Supported hosts are listed in `server/image-import.js`: Beaulieu Canada, Shaw's Widen CDN, Torlys, Adobe Scene7, Biyork, Shopify CDN, MSI, ViFloor, Goodfellow, Richmond/Shnier, Lee, Pentz, Godfrey Hirst/Cloudinary, Forbo, Shaw Contract's image CDN and Brandfolder. Adding another host requires a reviewed code change; an arbitrary URL proxy is intentionally not exposed.

The catalogue migration's image references remain external manufacturer URLs; they are not R2 copies and depend on those hosts remaining available. To replace one with your own stored image, import or upload a swatch in admin. The catalogue images do not create R2 read operations. Admin link imports create R2 writes; subsequent serving follows the existing media route.

## Rebuild image data

Observed source URLs are retained in `catalogue-imports/image-sources-2026-09-27.json`. The original catalogue batch stays unchanged. To regenerate the image migration and exact display URL allowlist:

```powershell
node tools/build-catalogue-images.mjs
node tools/build-catalogue-import.mjs
node tools/build.mjs
```

These commands generate local files only. Local tests cover unauthorized imports, unsafe URLs and redirects, size/type rejection, private R2 storage, migration counts and repeat application. Live manufacturer downloads and rendering should also be checked after deployment; external links can change.
