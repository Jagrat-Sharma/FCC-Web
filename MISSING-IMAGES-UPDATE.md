# Missing product images — 1 October 2026

Added 17 locally hosted images from the manufacturers:

- Patcraft Traced I0731: all ten existing colour choices, matched by manufacturer colour name and code.
- Mohawk Rare Vintage CDL74: all six existing colour choices, including Fawn Chestnut.
- Lee Coastal Driftwood 705: the manufacturer installation photograph.

The images are stored as WebP assets with the website. Traced and Rare Vintage use 1200 × 1200 images; Coastal Driftwood is 1200 × 675. Source URLs, colour identities and dimensions are recorded in `catalogue-imports/missing-image-sources.json`.

## Deployment

1. Push the updated code, `assets/catalogue/`, and migration through the existing GitHub workflow. Wait for Pages to deploy successfully.
2. From the FCC-website directory, run:

```powershell
npx wrangler d1 migrations apply fcc-cms --remote
```

Migration `0010_missing_product_images.sql` fills only empty colour image fields on the three imported products. It leaves existing uploaded/external images, descriptions, visibility and other edits intact. Reapplying it is safe. No R2 upload or additional bindings are required. No remote migration or deployment was performed during this change.

After deploying and applying the migration, refresh the products page. Each product card uses its first available colour image; the popup shows the corresponding selected swatch. The previously missing Dye Lab and Hydrasafe colours are outside this three-product update; 21 catalogue colours still lack images.

## Sources

- https://www.patcraft.com/product/detail/traced-I0731/00120
- https://www.mohawkflooring.com/shop/Laminated_Wood/detail/CDL74/Rare_Vintage/01W/Fawn_Chestnut
- https://leeflooring.ca/products/vinyl/luxury-vinyl/coastal-driftwood/
