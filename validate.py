from html.parser import HTMLParser
from pathlib import Path

class Check(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.images = []
        self.headings = 0
        self.pages = []
        self.active = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag == 'a' and attrs.get('href', '').startswith('#'): self.links.append(attrs['href'][1:])
        if tag == 'a' and not attrs.get('href', '').startswith('#'): self.pages.append(attrs.get('href', ''))
        if tag == 'a' and attrs.get('aria-current') == 'page': self.active.append(attrs.get('href'))
        if tag == 'img': self.images.append(attrs)
        if tag == 'h1': self.headings += 1

root = Path(__file__).resolve().parent
names = ['index.html', 'products.html', 'about.html', 'gallery.html', 'contact.html', 'faq.html']
routes = dict(zip(names, ['/', '/products/', '/about/', '/gallery/', '/contact/', '/faq/']))
for name in names + ['wordpress/' + n for n in names]:
    parser = Check()
    parser.feed((root / name).read_text(encoding='utf-8'))
    assert len(parser.ids) == len(set(parser.ids)), 'Duplicate IDs'
    assert all(link in parser.ids for link in parser.links), 'Missing anchor target'
    assert all(image.get('alt') for image in parser.images), 'Missing image text'
    assert parser.headings == 1, 'Expected one main heading'
    wordpress = name.startswith('wordpress/')
    expected = routes[Path(name).name] if wordpress else name
    assert parser.active == ([] if Path(name).name == 'index.html' else [expected]), 'Incorrect current page'
    for link in parser.pages:
        if link.startswith('https://www.google.com/maps/search/?'):
            continue
        if link.startswith(('tel:', 'mailto:')):
            assert link.split(':', 1)[1], 'Empty contact link'
            continue
        destination, _, fragment = link.partition('#')
        if wordpress:
            assert destination in routes.values(), 'Broken WordPress page link'
            target = root / 'wordpress' / next(key for key, value in routes.items() if value == destination)
        else:
            target = root / destination
            assert target.is_file(), 'Broken page link'
        if fragment:
            target_parser = Check()
            target_parser.feed(target.read_text(encoding='utf-8'))
            assert fragment in target_parser.ids, 'Missing category target'
    print(f'{name}: anchor links, unique IDs, image descriptions and main heading passed')
