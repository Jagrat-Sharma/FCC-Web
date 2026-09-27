# First catalogue batch — 27 September 2026

This batch stops at the products reviewed before the request to pause further scanning.

- **25 new draft products**, **343 colour choices**, **19 brands**.
- Existing Beaulieu Strong Intuition remains unchanged: one product, nine colours.
- After all migrations, a fresh database has 26 products and 352 colour choices.
- No live Cloudflare database, R2 bucket or GitHub deployment was changed.
- No prices, manufacturer inventory quantities or warranty promises were imported.

## Apply to Cloudflare

From the FCC-website directory:

```powershell
node tools/build.mjs
npx wrangler d1 migrations apply fcc-cms --remote
```

Then commit/push the project through your normal GitHub deployment workflow so Pages deploys the updated server image allowlist and category fields. If applying migrations with Wrangler asks you to authenticate, use your Cloudflare account that owns the fcc-cms database.

Migration `migrations/0008_reviewed_catalogue_batch.sql` adds these products as drafts. It does not overwrite existing admin edits or publish anything. An existing product with the same brand/name is skipped. Existing Strong Intuition data is not touched.

## Client workflow

1. Open your website's `/admin/` dashboard and sign in.
2. Open Products; search for a product name from the table below.
3. Review specifications and colour names against your supplier's current information.
4. Upload a product image and any missing colour swatches. Uploaded images use the existing R2 workflow.
5. Save the product. Return to the overview and enable **Display on website** when ready; that switch saves immediately.

Brand filters use the imported brand names. A draft brand does not appear publicly until at least one of its products is published. Area Rugs, Linoleum and Commercial Matting have been added as proper categories rather than misclassifying those products as vinyl.

## Image status

**305 manufacturer image references** are now attached after migration `0009_catalogue_images.sql`: the original 36 plus 269 additional matching swatches. These are external URLs, not downloaded R2 files. Some are small manufacturer thumbnails; replace them with higher-resolution swatches when available. Deployed image loading has not been visually verified. See [image setup and admin instructions](IMAGE-IMPORT.md).

**38 colour choices still have no image:** Dye Lab (12), Traced (10), Hydrasafe (9), Rare Vintage (6), and Coastal Driftwood (1). They remain selectable by name; the product popup shows “Swatch image coming soon” instead of displaying another colour's photograph. No substitute or guessed swatch images were added. Existing Strong Intuition's nine external URLs remain unchanged.

The server accepts only the exact reviewed new image URLs plus the existing Beaulieu list. Arbitrary external URLs remain rejected. The admin image policy allows the corresponding manufacturer origins.

## Imported entries

| Brand | Product | Colours | Review notes |
| --- | --- | ---: | --- |
| Aladdin Commercial | [Daily Wire — 2B194](https://www.aladdincommercial.com/carpet/detail/32303-301147/Daily-Wire-Viral-Reality) | 6 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Shaw Floors | [Classic Tone — 5E915](https://shawfloors.com/en-us/carpet/classic-tone-minimalist-12-ft-100-anso-high-performance-solution-dyed-pet/5e915-00500) | 35 | Manufacturer-hosted images: 34 swatch thumbnails at 120 px and one 840 px main image. Upload higher-resolution swatches when available. URLs extracted from manufacturer page; end-to-end image loading on deployed site not verified. |
| Shaw Contract | [Dye Lab Tile — 5T041](https://www.shawcontract.com/en-us/products/5t041) | 24 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Philadelphia Commercial | [Profusion 26 — 54969](https://philadelphiacommercial.com/products/carpet/details/profusion-26/54969/masses/00200) | 22 | Detailed construction specifications have not been imported. |
| Patcraft | [Traced — I0731](https://www.patcraft.com/product-category/carpet) | 10 | Names verified from manufacturer category listing; colour codes and detailed specifications pending. Do not assume code 00120 belongs to the first colour. |
| Stanton Carpet | [Jazzy](https://www.stantoncarpet.com/product/JAZZY/SKY) | 13 | Only Sky has a verified colour code. Collection: Atelier Marquee. |
| Anderson Tuftex | [Always Natural — ZZ289](https://andersontuftex.com/en-us/rugs/always-natural-inlet-12-ft-100-anso-high-performance-nylon/zz289-00437) | 18 | Source is the custom-rug product; 12 ft is material width, not a finished rug size. |
| Pentz Commercial | [Echo Tile — 7055T](https://www.pentzcommercial.com/product/echo-tile/) | 14 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Godfrey Hirst | [Inspirational](https://www.godfreyhirst.com/au/products/inspirational?colour=cloudy-day) | 30 | AUSTRALIAN catalogue. Confirm Canadian supply with your distributor before publishing. |
| Goodfellow | [Hydrasafe 12 mm](https://www.goodfellowinc.com/en/produit/hydrasafe-12-mm-2/) | 9 | Baffin marked limited by manufacturer; no live stock quantity imported. |
| Torlys Flooring | [Olympic 5](https://torlys.com/collection/olympic-5/) | 8 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Biyork Floors | [HydroGen 5](https://www.biyorkcanada.com/collections/hydrogen-5-collection) | 8 | Collection specifications verified on Cashmere detail page. Colour SKU codes pending. Sample prices excluded. |
| MSI Surfaces | [Cyrus](https://www.msisurfaces.com/luxury-vinyl-planks/cyrus/) | 40 | Names from collection listing; individual SKU codes pending. |
| Interface | [Open Air 417 — 9690C](https://shop.interface.com/CA/en-CA/carpet-tile/open-air-417/9690C.html) | 24 | Reviewed names/specifications; confirm local availability and upload missing images. |
| ViFloor | [Super Series](https://www.vifloor.com/products/commercial-matting/super-series/) | 24 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Richmond Flooring (Shnier/Gesco) | [AquaSure Pro](https://www.richmondflooring.ca/en/product/coastal-1?more_aod=3) | 5 | Manufacturer page conflicts on thickness (7+1 mm in table versus 8+1 mm in description). Thickness omitted until confirmed. |
| Richmond Flooring (Shnier/Gesco) | [Accord Select](https://www.richmondflooring.ca/en/product/gulf-island-1?more_aod=3) | 6 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Richmond Flooring (Shnier/Gesco) | [Solidarity](https://www.richmondflooring.ca/en/product/lodge-3?more_aod=3) | 7 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Richmond Flooring (Shnier/Gesco) | [Accord Premium](https://www.richmondflooring.ca/en/product/muldrew-1?more_aod=3) | 7 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Richmond Flooring (Shnier/Gesco) | [AquaSure Premium](https://www.richmondflooring.ca/en/product/windsor-tan?more_aod=3) | 5 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Richmond Flooring (Shnier/Gesco) | [AquaSure Chic](https://www.richmondflooring.ca/en/product/bushwick-1?more_aod=3) | 10 | Reviewed names/specifications; confirm local availability and upload missing images. |
| Richmond Flooring (Shnier/Gesco) | [Dovedale](https://www.richmondflooring.ca/en/product/erie?more_aod=3) | 10 | PARTIAL: 10 of 12 listed colours captured before research paused. Pinecrest and the final colour require verification. |
| Mohawk Industries | [Rare Vintage — CDL74](https://mohawk-var.s3.amazonaws.com/I2017/hard-surface-product-sheets/MHK_RWS_Rare%20Vintage_SS_OL_1903.pdf) | 6 | ARCHIVED 2019 manufacturer sheet. Confirm current range and specifications before publishing. Live product data unavailable. |
| Lee Flooring | [Coastal Driftwood — 705](https://leeflooring.ca/products/vinyl/luxury-vinyl/coastal-driftwood/) | 1 | PARTIAL category: only this individual product was fully reviewed; other 17 linked products not imported. |
| Forbo | [Marmoleum Solid](https://www.forbo.com/flooring/en-us/commercial-products/marmoleum/marmoleum-solid/marmoleum-solid-all-colors/b57vpn) | 1 | PARTIAL: only Titan 3761 exposed in scanned page; remaining Solid colours not verified. |

## Deferred sources

No products were created for these sources because the requested product data was not verified before research paused:

- Karastan — Vintage Grace: product details and full colour range.
- Dreamweaver — Palma: product data unavailable in the scanned page.
- Preverco — filtered red-oak catalogue: range and platform variants unresolved.
- Fuzion — SmartDrop Elite + 7 identified, but product list not captured.
- Vidar — linked East Canada SPC page returned no results.
- Twelve Oaks — linked SureWood category not verified; other SureWood collections were not substituted.

Partial imports also remain: Dovedale has 10 of 12 listed colours; Lee has only the fully reviewed Coastal Driftwood product; Forbo has only Titan 3761. Mohawk Rare Vintage uses an archived 2019 manufacturer sheet. Godfrey Hirst Inspirational comes from the Australian catalogue and needs Canadian supply confirmation.

## Maintaining this batch

`catalogue-imports/2026-09-27.json` contains sources, private review notes and the reviewed colour data. It is not copied into the public Pages build.

`node tools/build-catalogue-import.mjs` deterministically rebuilds this batch's SQL and exact image allowlist. Once migration 0008 has been deployed, put future imports or corrections in a **new migration**; editing an already applied migration will not update Cloudflare D1.

Validation:
- All eight CMS tests pass, including full migration application, 25 admin edit round-trips, colour preservation, draft isolation, URL rejection and preservation of client edits.
- The standard Pages build and whitespace check are run before handover.

