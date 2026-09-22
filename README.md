# First Choice Carpets — Brampton five-page website

## Active working folder and Products dropdown

The supplied logo is saved at `assets/first-choice-logo.png`. For WordPress, upload it to Media Library and run `python build.py --logo-url "YOUR_UPLOADED_LOGO_URL"` before pasting the regenerated snippets. The embedded location maps require an internet connection and WordPress permission to retain iframe markup. If the editor removes the map, use a supported map block and the provided directions link. The address is in Brampton; the stated service area is Toronto. The user supplied the “Since 1991” family-business description and the two slogans.

Homepage decorative icons use Lucide SVGs (lucide-static 0.468.0) hosted by jsDelivr through CSS masks. They inherit the surrounding text colour and need an internet connection. Text labels remain readable if the icons cannot load. Source: https://lucide.dev/icons/ — licensing: https://lucide.dev/license. This replaces the homepage's Unicode arrow, chevron, house, sparkle and decorative quotation symbols. Normal text punctuation is unchanged.

Products now contains a sample catalogue with 12 illustrative swatches, search, eight category filters, sorting, a 6/12 page-size selector, pagination and expandable product details. Edit the article content and data-name/data-category/data-label attributes in products.html to maintain the sample catalogue. Replace illustrations and sample names with the real product catalogue before launch.

Load `catalogue.js` on the WordPress Products page as well as `navigation.js`. Without the catalogue script, all cards and details remain readable, but search/filter controls are disabled. The dropdown category links select a category when the catalogue script is loaded. This is a catalogue/enquiry interface, not a checkout or inventory integration.

This copy in `FCC-website` is now the working project. Do not package a ZIP until the user confirms completion.

Every page includes a Products dropdown with eight category links grouped into Soft surfaces, Wood & wood looks, and More for your space. Hover opens the menu with a mouse. Click or tap the Products label to toggle it; keyboard users can focus the label and press Enter or Space. Escape closes it, and clicking outside dismisses it. View all products opens the separate Products page; category links open the relevant category on that page.

Keep `navigation.js` beside the standalone HTML files. For WordPress, load it once through your child theme or a supported script integration on all five pages. The snippets intentionally omit script tags; without this script the native dropdown still opens by clicking, tapping or using the keyboard, but does not open on hover. Continue to add the shared `styles.css` through Additional CSS. Test the saved pages in your theme after installation.

The reference supplied the category ideas, not confirmed inventory. No brands, thicknesses or species were invented. All categories lead to enquiry guidance with an availability note.

## Updated: separate pages

The website now has five separate pages: `index.html` (Home), `products.html`, `about.html` (About Us), `gallery.html`, and `contact.html`. Navigation opens a new page and underlines the current page. The shared CSS keeps the same design throughout.

**Use this updated WordPress workflow instead of the original single-page steps below:** create five WordPress Pages named Home, Products, About Us, Gallery and Contact. Use slugs `products`, `about`, `gallery`, and `contact`. Paste the matching snippet from the `wordpress` folder into a Custom HTML block on each page. Use `wordpress/index.html` for Home. Add `styles.css` once to Additional CSS, and use a blank/full-width template for every page. Set Home as the static homepage when ready.

The WordPress links point to `/`, `/products/`, `/about/`, `/gallery/`, and `/contact/`. For a subdirectory installation, run `python build.py --base-url /your-subdirectory/` or replace these links with your actual permalinks. Until Home is assigned as the static homepage, `/` may still open the previous homepage.

Edit the five top-level HTML files, then run `python build.py` to refresh all five WordPress snippets. `wordpress-content.html` is retained as a Home-only copy. The demonstration enquiry is now on Contact only; replace its placeholder in WordPress with verified contact details and a connected Form block. No live WordPress changes have been made.

Open `index.html` in a browser for the complete responsive preview. Keep styles.css and script.js next to it. Photography needs an internet connection.

## Put it into WordPress

1. Create a draft page called Home. Choose a full-width or blank page template. Hide the theme's page title. This design already includes a header and footer; use a page-specific blank template to avoid duplicates without changing other pages.
2. Add a **Custom HTML** block, not a Code block. Paste the contents of `wordpress-content.html` into it.
3. Paste `styles.css` into your theme's Additional CSS editor. For a block theme, look under Appearance → Editor → Styles → Additional CSS (the location can vary by theme/version).
4. The WordPress version deliberately replaces the demo form with a simple contact placeholder. Replace that placeholder with your verified phone/email links, or add your preferred WordPress Form block below the HTML block and connect its notifications to your business email. Set its HTML anchor to `fcc-contact-form` and update the quote link if necessary. Do not split an open HTML element across blocks.
5. Upload your own images to Media Library and replace the image URLs. Add real business contact information, confirm the product range and installation services, and replace the review placeholder with approved customer feedback.
6. Preview desktop and mobile, save, and check the saved page again. Themes may add content-width restrictions; select full width on the containing block/template. If your theme already outputs a main landmark, change this component's main element to a div while keeping its id.
7. When ready to launch, set Home as the static homepage in Settings → Reading. Verify the contact form actually delivers to your inbox before publishing.

This ZIP is a source-code package, **not an installable theme**. Do not upload it under Appearance → Themes or Tools → Import. The HTML is edited as code inside a Custom HTML block; it is not a collection of native visual-editor blocks.

## WordPress.com compatibility

WordPress.com's current documentation lists custom CSS on paid plans, including Personal. Restricted HTML such as forms and scripts requires a paid plan with hosting features activated. The included WordPress snippet omits the demo form and JavaScript; the page design does not need JavaScript. Check your own plan and the saved page before launch.

- Custom HTML: https://wordpress.com/support/wordpress-editor/blocks/custom-html-block/
- Custom CSS: https://wordpress.com/support/editing-css/

## Files and maintenance

- `index.html`: standalone preview; edit the copy here first.
- `styles.css`: scoped design, colours and responsive layouts. Main colours live in `.fcc` at the beginning.
- `script.js`: optional local enquiry download for the standalone preview. It does not send email, make network requests or store form details.
- `wordpress-content.html`: paste-ready page content with a contact placeholder instead of the demo form.
- `build.py`: regenerates the WordPress snippet after edits to index.html.

Run `python build.py` from this directory after changing index.html, then copy the refreshed snippet into WordPress. No build tools or packages are required to view the site.

## Before launch

Only the company name and Brampton service area were supplied. Phone, email, address, opening hours, verified reviews, actual installations, available product lines, guarantees and prices have not been invented. Replace the labelled placeholders, confirm the proposed categories, and remove preview notes only after supplying the relevant information. The FC monogram is a temporary text-based identity, not an existing company logo.

Images are externally hosted Unsplash reference interiors and are not First Choice Carpets work. The plank swatches are CSS illustrations. Replace them with owned or appropriately licensed product/project images before launch. Image requests go to the external image host; there are no analytics, cookies or tracking scripts in this code.

The contact section is a prototype, not a working lead-delivery system. Use a maintained WordPress form solution with notifications, spam protection and a privacy notice appropriate to your business. No backend or live WordPress installation is included.
#   F C C - W e b  
 
