# Product catalogue upgrade

## Deploy in this order

1. Back up/export your production D1 database from the Cloudflare dashboard.
2. From the FCC-website folder, apply the new additive migration to the existing database:

   ```powershell
   npx wrangler d1 migrations apply fcc-cms --remote
   ```

   This applies `migrations/0002_product_specifications.sql`. Do not recreate the database or rerun the initial schema manually. Existing products retain their content and visibility.
3. Build and test:

   ```powershell
   node tools/build.mjs
   node --test --test-isolation=none tests/cms.test.mjs
   ```
4. Commit and push the changed project files to your connected GitHub repository. Cloudflare Pages uses its existing build configuration. Apply the migration BEFORE the new code deploys: the updated API needs the new columns.
5. Keep the existing Access application protecting both `/admin` (and descendants) and `/api/admin` (and descendants). No new bindings, bucket, database or secrets are needed.
6. Reload the website. All public and admin HTML pages use the same FC favicon with a content-versioned URL in the build.

## Client workflow

The dashboard has Products, Gallery and Images sections. Choose Products, then Add product. Select any of the eight category buttons to open a separate product page. Enter the name, company/brand, description, image and optional category specifications. Include units in dimensions and coverage. Leave specifications blank when unknown; never infer manufacturer performance claims. Turn on Display on website and save to publish. Existing products can be edited on the same full-page form. Gallery editing and image management remain available.

Published brand names automatically appear in the public company checkbox filter. Multiple selected companies are combined; the category and text search further narrow results. Company A–Z sorts by brand then product name. Public product details show only populated specification rows. Existing products have blank brand/specification fields until edited.

## Field references

These sources informed field names, not inventory data or claims about the client's stock:

- Carpet width, fibre and backing: https://shawfloors.com/en-us/carpet/sunbrook-silver-leaf-12-ft-100-bcf-endura-iii-plus-nylon/5575g-00541
- Hardwood species, dimensions, veneer and carton coverage: https://shawfloors.com/en-us/hardwood/pacific-grove-gold-dust-6-38-in-8-2-mm-maple-scraped-30-48-sq-ft-carton-/sw594-01001
- Laminate dimensions and installation resources: https://www.mohawkhomeflooring.com/laminateresources
- Vinyl construction, thickness and wear layer: https://mohawkcdn.blob.core.windows.net/pdf-product-prod/2_8190_LP6_Active_Tec_Wood.pdf
- Carpet tile size and backing: https://shop.interface.com/US/en-US/carpet-tile/on-line/7335C.html
- Tile dimensions, thickness and finish: https://www.daltile.com/products/concrete-look/portfolio/white
- Accessories use optional general material, size, coverage, compatibility and application fields because specifications vary by accessory.

The shared `product-fields.js` controls category fields and display labels. `brand` is indexed separately in D1 for filtering; other specifications are a validated JSON object. Public endpoints remain read-only, and existing Access authentication and mutation checks protect all writes.
