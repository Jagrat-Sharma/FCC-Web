"""Refresh theme design assets and page seeds; never changes PHP or client data."""
from pathlib import Path
import re
import shutil

root = Path(__file__).resolve().parent
theme = root / 'wordpress-ready' / 'first-choice-carpets'
(theme / 'assets').mkdir(parents=True, exist_ok=True)
(theme / 'seed').mkdir(exist_ok=True)
for name in ['styles.css', 'navigation.js']:
    shutil.copy2(root / name, theme / 'assets' / name)
for name in ['first-choice-logo-trimmed.png', 'first-choice-logo.png']:
    shutil.copy2(root / 'assets' / name, theme / 'assets' / name)
shutil.copy2(root / 'favicon.png', theme / 'assets' / 'favicon.png')
routes = {'index.html': 'home', 'products.html': 'products', 'about.html': 'about', 'gallery.html': 'gallery', 'contact.html': 'contact', 'faq.html': 'faq'}
for filename, slug in routes.items():
    source = (root / filename).read_text(encoding='utf-8')
    content = re.search(r'<main id="fcc-main">(.*?)</main>', source, re.S).group(1)
    if slug == 'products':
        content = '<h1>Products</h1><p>Our catalogue is being prepared. Please contact us for available flooring options.</p>'
    content = re.sub(r'<form id="fcc-quote-form">.*?</form>', '<p>Call <a href="tel:+19054585555">905-458-5555</a> or email <a href="mailto:firstchoicecarpets@hotmail.com">firstchoicecarpets@hotmail.com</a> to discuss your project.</p>', content, flags=re.S)
    content = content.replace('Choose a few details to prepare a project brief.', 'Tell us about your space, flooring preferences and timing.')
    content = re.sub(r'<div class="fcc-location">.*?</div>', '[fcc_map]', content, flags=re.S)
    for local, target in routes.items():
        content = content.replace('href="' + local + '"', 'href="{{' + target + '}}"')
    content = re.sub(r'href="products.html#fcc-([a-z0-9-]+)"', lambda m: 'href="{{category:' + m[1] + '}}"', content)
    (theme / 'seed' / (slug + '.html')).write_text('<!-- wp:html -->\n' + content + '\n<!-- /wp:html -->', encoding='utf-8')
source = (root / 'index.html').read_text(encoding='utf-8')
footer = re.search(r'<footer.*?</footer>', source, re.S).group()
footer = re.sub(r'<a class="fcc-brand".*?</a>', '<?php fcc_logo(); ?>', footer, flags=re.S)
footer = re.sub(r'<div class="fcc-location">.*?</div>', '<?php echo fcc_map(); ?>', footer, flags=re.S)
footer = footer.replace('<span>Website preview</span>', '')
footer = footer.replace('© First Choice Carpets', '© <?php echo esc_html(wp_date("Y")); ?> First Choice Carpets')
(theme / 'footer.php').write_text('<?php defined("ABSPATH") || exit; ?>\n' + footer + '\n</div><?php wp_footer(); ?></body></html>\n', encoding='utf-8')
print('Theme assets, footer and six draft-page seeds prepared. No archive created.')
