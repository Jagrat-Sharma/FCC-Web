# First Choice Carpets — WordPress conversion

This directory contains a classic WordPress theme and an optional companion catalogue plugin. The static preview remains in the parent FCC-website folder. Nothing has been deployed or activated on a live website, and no ZIP has been created.

## What is prepared

- `first-choice-carpets/`: theme with shared PHP header/footer, the burgundy design, supplied logo, contact information, map, responsive navigation and six draft-page seeds.
- `fcc-catalogue/`: enquiry-only plugin. While active, products cannot be purchased, prices and cart buttons are hidden, cart/checkout redirect to the catalogue, and product pages offer a prefilled email enquiry.
- Real WooCommerce products replace all illustrative static product cards. Search, category navigation, sorting, pagination, image galleries and product details use WooCommerce. The page size is 12; the static demo's 6/12 selector is not carried over.
- Product categories populate the dropdown automatically. Brand and Thickness use global WooCommerce attributes with slugs `brand` and `thickness`. Category + attribute links use WooCommerce's native attribute filters. Attribute terms are shared across the catalogue, so combinations with no products may show no results.
- Normal page text is stored in WordPress after setup, not served from static HTML files. The imported design uses Custom HTML blocks, so text/layout edits use the block's HTML editor. It has not been converted into individually editable visual blocks. Products are fully editable through the standard product editor.

## Install on a staging site first

1. Confirm your hosting allows custom themes and plugins. For WordPress.com, verify these capabilities are available and activated on your plan.
2. Back up the existing WordPress database and files. Record the current theme, front page and shop page settings.
3. Install and activate WooCommerce. No payment provider is needed for enquiry-only use.
4. Copy the complete `first-choice-carpets` directory to `wp-content/themes/` using your host's file manager or SFTP. Activate **First Choice Carpets** under Appearance → Themes. Do not upload the static homepage source ZIP as a theme.
5. Copy `fcc-catalogue` to `wp-content/plugins/`, then activate **First Choice Catalogue** under Plugins. Keep it active unless online purchasing is deliberately being introduced. It applies to the whole WooCommerce catalogue.
6. Open Appearance → First Choice setup. Click **Create missing draft pages and categories**. This is a deliberate action, not an automatic activation import. Existing page slugs and products are preserved. It also creates global Brand and Thickness attributes if missing.
7. Review the draft Home, Products, About Us, Gallery, Contact and FAQ pages. Replace sample photography and the review placeholder; complete the FAQ or leave that page in draft until ready. Review the supplied slogans, service area and opening hours with the client.
8. Publish approved pages. Under Settings → Reading select Home as the static homepage. Under WooCommerce → Settings → Products choose Products as the shop page. The Products page body is a fallback; WooCommerce renders the real catalogue in its place. Existing matching pages are not replaced by the importer: adapt them manually if this is not a fresh site.
9. Save Settings → Permalinks. The imported content links use the permalink structure selected when setup runs. If you later change domains, page slugs or permalink settings, update those content links. Shared navigation uses WordPress-generated URLs.
10. Set the logo using Appearance → Customize → Site Identity if you want to replace the bundled fallback. Upload `first-choice-carpets/assets/favicon.png` or a new square client icon through Settings → General → Site Icon. The icon is controlled by WordPress, not hardcoded by the theme.

## Client product workflow

1. Products → Add New: enter a product name, description and short description.
2. Upload a featured product image and optional gallery images.
3. Select the appropriate product category. The setup creates Carpet, Carpet Tiles, Engineered Hardwood, Laminate Flooring, Solid Hardwood, Vinyl Flooring, Tiles and Accessories. Do not change their slugs without updating the category-specific submenu logic in header.php.
4. Under Products → Attributes, add the actual terms for Brand and Thickness. Assign those **global attributes** to relevant products; free-text per-product attributes do not power the dropdown filters. Mark them visible on the product page.
5. Publish. The new product appears automatically in the catalogue and its category. Drafts remain unpublished. With catalogue mode active, a price is not needed to accept email enquiries.
6. Use Products → All Products to edit, unpublish or delete items. WooCommerce's built-in CSV importer can handle a larger catalogue.

The Enquire button opens the visitor's email application with the product name and URL. It does not send mail by itself. Contact offers real phone/email links; the static demo download form is removed. If an on-site form is preferred, configure a maintained WordPress form plugin with email delivery and spam protection, then insert its block or shortcode on Contact. This has not been configured for you.

## Required staging acceptance checks

- Visit all six pages and verify the Home menu link is hidden only on the homepage.
- Test the Products dropdown with mouse, keyboard and touch, including mobile submenus and outside-click/Escape dismissal.
- Add two real draft/test products with different categories, Brand and Thickness terms. Publish only on staging. Verify search, combined category/attribute filters, pagination, images and product detail links.
- Confirm catalogue mode prevents purchases and cart/checkout redirect. Confirm the enquiry email opens with the correct product information and the supplied business email.
- Check phone links, maps, logo, favicon, and layouts at desktop/tablet/mobile sizes. Maps, reference photos and homepage icons need external network access.
- Test the setup action twice: it should not duplicate or overwrite pages/categories. Keep a backup regardless.
- The setup creates drafts but does not publish them, change homepage/shop settings, install plugins or overwrite products.

## Validation status

Source structure and static-page link checks have been run locally. PHP is not installed in this environment, and no WordPress/WooCommerce instance is connected. PHP execution, theme activation, WooCommerce queries, plugin interoperability and browser layout still require testing on staging. This is prepared conversion source, not a verified live deployment.

## Maintenance and handover

`python prepare_wordpress.py` in the parent folder refreshes the copied design assets, footer and seed content from the static prototype. It does not regenerate PHP logic or change imported WordPress pages. Do not rerun it over custom edits to those generated files without reviewing changes. Once WordPress becomes the source of truth, maintain content in WordPress and stop copying static content over it.

Header/footer business details and the fixed page links live in the theme files; editing them currently requires a developer. Use a child theme for subsequent developer customizations. Products remain in the WordPress database when switching themes, and catalogue behavior stays in the separate plugin. Store a backup and provide client product-editor training before handover.

No archive is created until the user confirms the project is complete.

## Official references

- https://developer.wordpress.org/themes/core-concepts/including-assets/
- https://developer.woocommerce.com/docs/theming/theme-development/classic-theme-developer-handbook
- https://woocommerce.com/document/managing-products/
