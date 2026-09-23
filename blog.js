// Render plain text with DOM APIs; authored content is never treated as HTML.
(() => {
  const posts = document.getElementById('blog-posts');
  const status = document.getElementById('blog-status');
  const retry = document.getElementById('blog-retry');
  const previous = document.getElementById('blog-previous');
  const next = document.getElementById('blog-next');
  const id = new URLSearchParams(location.search).get('id');
  let page = 1;
  function element(tag, text) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    return node;
  }
  async function load() {
    retry.hidden = previous.hidden = next.hidden = true;
    status.textContent = 'Loading articles…';
    posts.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(id ? '/api/blogs/' + encodeURIComponent(id) : '/api/blogs?limit=9&page=' + page);
      if (response.status === 404) {
        posts.replaceChildren();
        status.textContent = 'This article is not available.';
        const back = element('a', 'Back to the blog');
        back.href = 'blog.html';
        posts.append(back);
        return;
      }
      if (!response.ok) throw new Error();
      const data = await response.json();
      const fragment = document.createDocumentFragment();
      for (const item of id ? [data.item] : data.items) {
        const article = element('article');
        if (item.image_url) {
          const image = element('img');
          image.src = item.image_url;
          image.alt = item.image_alt;
          image.loading = 'lazy';
          article.append(image);
        }
        const body = element('div');
        const time = element('time', new Date(item.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }));
        time.dateTime = item.created_at;
        body.append(time);
        if (id) {
          document.getElementById('blog-heading').textContent = item.title;
          document.title = item.title + ' | First Choice Carpets';
          document.querySelector('meta[name="description"]').content = item.description;
          posts.classList.add('fcc-blog-article');
          for (const paragraph of item.content.split(/\n\s*\n/)) body.append(element('p', paragraph));
          const back = element('a', 'Back to all articles');
          const related = element('nav');
          related.setAttribute('aria-label', 'Plan your flooring project');
          for (const [label, href] of [['Explore flooring', 'products.html'], ['Installation services', 'services.html'], ['Visit our Brampton showroom', 'contact.html']]) {
            const link = element('a', label);
            link.href = href;
            const paragraph = element('p');
            paragraph.append(link);
            related.append(paragraph);
          }
          body.append(related);
          back.href = 'blog.html';
          body.append(back);
        } else {
          const heading = element('h2');
          const link = element('a', item.title);
          link.href = 'blog.html?id=' + encodeURIComponent(item.id);
          heading.append(link);
          body.append(heading, element('p', item.description));
          const read = element('a', 'Read article');
          read.href = link.href;
          body.append(read);
        }
        article.append(body);
        fragment.append(article);
      }
      posts.replaceChildren(fragment);
      status.textContent = !id && !data.items.length ? 'New flooring stories and advice are coming soon.' : '';
      previous.hidden = !!id || page === 1;
      next.hidden = !!id || page * 9 >= data.total;
    } catch {
      status.textContent = 'Articles are temporarily unavailable. Please try again.';
      retry.hidden = false;
    } finally {
      posts.setAttribute('aria-busy', 'false');
    }
  }
  retry.onclick = load;
  previous.onclick = () => { page--; load(); };
  next.onclick = () => { page++; load(); };
  load();
})();
