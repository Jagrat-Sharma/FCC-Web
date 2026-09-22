"""Static package checks only; this does not execute PHP or WordPress."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
theme = root / 'first-choice-carpets'
for name in ['style.css', 'functions.php', 'header.php', 'footer.php', 'page.php', 'index.php', '404.php', 'woocommerce.php', 'inc/setup.php', 'assets/styles.css', 'assets/navigation.js', 'assets/first-choice-logo-trimmed.png']:
    assert (theme / name).is_file(), name
assert 'Theme Name: First Choice Carpets' in (theme / 'style.css').read_text()
header = (theme / 'header.php').read_text()
footer = (theme / 'footer.php').read_text()
assert 'wp_head()' in header and 'wp_body_open()' in header and 'wp_footer()' in footer
for name in ['home', 'products', 'about', 'gallery', 'contact', 'faq']:
    seed = (theme / 'seed' / (name + '.html')).read_text(encoding='utf-8')
    assert '<script' not in seed and 'fcc-quote-form' not in seed and '<iframe' not in seed
    assert not re.search(r'href="[a-z-]+\.html', seed), name
    assert 'fcc-catalog-card' not in seed, 'Sample products must not be imported'
setup = (theme / 'inc/setup.php').read_text()
assert "check_admin_referer('fcc_create_pages')" in setup
assert "current_user_can('manage_options')" in setup
assert "'post_status' => 'draft'" in setup
plugin = (root / 'fcc-catalogue' / 'fcc-catalogue.php').read_text()
assert 'woocommerce_is_purchasable' in plugin and 'woocommerce_add_to_cart_validation' in plugin
assert not list(root.glob('*.zip'))
print('PASS: required theme files, WP hooks, draft import protection, native product integration, enquiry mode and no ZIP.')
print('PHP execution and live WordPress/WooCommerce testing still required.')
