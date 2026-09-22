from pathlib import Path
import re
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='/', help='WordPress site root URL or subdirectory')
parser.add_argument('--logo-url', help='Uploaded logo URL from WordPress Media Library')
args = parser.parse_args()
base = args.base_url.rstrip('/') + '/'
root = Path(__file__).resolve().parent
routes = {'index.html':'', 'products.html':'products/', 'about.html':'about/', 'gallery.html':'gallery/', 'contact.html':'contact/'}
output = root / 'wordpress'
output.mkdir(exist_ok=True)
for filename in routes:
 source = (root / filename).read_text(encoding='utf-8')
 content = source.split('<!-- WORDPRESS CONTENT START -->')[1].split('<!-- WORDPRESS CONTENT END -->')[0].strip()
 content = content.replace('src="assets/first-choice-logo-trimmed.png"', f'src="{args.logo_url or base + "assets/first-choice-logo-trimmed.png"}"')
 replacement = '<div class="fcc-contact-placeholder"><p>Call <a href="tel:+19054585555">905-458-5555</a> or email <a href="mailto:firstchoicecarpets@hotmail.com">firstchoicecarpets@hotmail.com</a> to discuss your flooring project.</p></div>'
 content = re.sub(r'<form id="fcc-quote-form">.*?</form>', replacement, content, flags=re.S)
 content = content.replace('Choose a few details to prepare a project brief.', 'Tell us about your rooms, preferred flooring and project timing.')
 for local, route in routes.items():
  content = content.replace(f'href="{local}"', f'href="{base}{route}"')
  content = content.replace(f'href="{local}#', f'href="{base}{route}#')
 (output / filename).write_text(content + '\n', encoding='utf-8')
 if filename == 'index.html': (root / 'wordpress-content.html').write_text(content + '\n', encoding='utf-8')
print('Updated all five WordPress snippets.')
