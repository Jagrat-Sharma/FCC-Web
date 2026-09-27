# Catalogue imports

## First multi-brand batch — 2026-09-27

See [CATALOGUE-BATCH-1.md](CATALOGUE-BATCH-1.md) for the 25 new drafts, 343 colour choices, sources, image gaps, deferred catalogues and deployment instructions. Migration 0008 preserves the existing Strong Intuition entry and all subsequent admin edits. No remote database changes have been made.

## Beaulieu Canada — Strong Intuition J5436

Prepared as one draft product with nine colour names/codes in its description. Manufacturer/company: Beaulieu Canada. Manufacturer brand: Tryesse. Collection: Tryesse Pro. Source checked 2026-09-27:

https://canada.beaulieucanada.com/en/pdf/bulletins?0%5Bcategory%5D=broadloom&0%5Bcode%5D=j5436&0%5Blanguage%5D=en&0%5BproductType%5D=carpet&0%5Bsegment%5D=residential&0%5Bwebsite%5D=beaulieu

Apply pending migrations with `npx wrangler d1 migrations apply fcc-cms --remote`. Then open Admin → Products → Strong Intuition. Upload the appropriate manufacturer product image, review the entry and enable Display on website when ready. No image or live database changes have been made in this import.

Width is omitted because the bulletin does not provide it. Standard roll length is explicitly labelled; it is not a guaranteed order length. No prices, stock counts, warranty promises or unverified specifications were added. Selectable colours are now supported. Migration 0006 adds the nine colour choices to this product. Upload each actual colour image in Admin → Products → Edit → Colour swatches. Do not substitute stock room photography for product swatches.

Migration 0005 inserts once with a fixed ID and does not overwrite later admin edits. Future catalogue links can be prepared in the same way.

## Colour swatches

Apply migrations before deploying: `npx wrangler d1 migrations apply fcc-cms --remote`. Each product has one shared description and up to 100 colours with a name, optional code and optional R2 image. Selecting a colour in product details changes the image and enquiry subject. Colours without uploaded images display names and an image-pending message. Draft swatch images are private and referenced swatch images cannot be deleted from the media library.

Migration 0007 attaches the nine original manufacturer-hosted JPEG URLs. Downloads were blocked in the development environment; these are external references, not R2 copies, and image loading remains unverified. Uploading a replacement in Admin overrides the external image. This depends on the manufacturer keeping the URLs accessible.
