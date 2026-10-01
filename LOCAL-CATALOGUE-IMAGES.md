# Locally hosted catalogue images

Existing catalogue images are now stored in `assets/catalogue/` and deployed as static Cloudflare Pages assets. This implements local hosting without an R2 migration. Admin uploads and image-link imports continue to use R2.

## Deploy

Commit and push the changed code **and assets/catalogue/** through the existing GitHub workflow. No new Cloudflare settings, bindings or D1 migrations are needed for this update. Deploy the code and image files together.

The API resolves the existing manufacturer URLs to local files through `catalogue-image-map.js`. Original URLs remain in D1 as provenance, so existing edits, colours, visibility settings and uploaded images are preserved. Uploaded images take precedence. The home page, product cards, product popup and admin previews use the local copies.

## Quality and coverage

All 314 existing image references were downloaded. Interface Open Air 417 previously requested 80 × 80 thumbnails; all 24 now request 1200 × 1200 images. Other supported image services were requested at larger sizes where possible. Files are decoded, converted to WebP and limited to 1200 pixels without enlarging smaller originals.

`catalogue-imports/local-image-report.json` records source URLs, downloaded dimensions, local filenames and images below 600 pixels. Local storage does not restore detail absent from the original. The previously documented 38 colours with no verified image source still need images.

Filenames contain a content hash and receive a one-year immutable cache header. These catalogue images do not incur R2 reads or Pages Function requests. The source-to-file mapping is served with revalidation so new deployments can change the mapping.

Static catalogue images are public assets, like the original manufacturer images. Draft product visibility still controls the product API. Admin-uploaded draft images retain their existing private R2 access rules.

## Refresh downloaded images

From the project root, run:

```powershell
node tools/download-catalogue-images.mjs
python tools/prepare-catalogue-images.py
node tools/build.mjs
node --test --test-isolation=none tests/cms.test.mjs
```

The preparation step requires Python with Pillow. Downloads are cached in the ignored `.image-cache/` folder; source failures are reported there. Commit generated assets, the image map and the report. Do not commit the download cache. Review the report and images before deployment. New admin images should continue to use the existing upload/import workflow.
