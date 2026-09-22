<?php defined('ABSPATH') || exit; get_header(); ?>
<main id="fcc-main" class="fcc-section fcc-wc">
<?php if (is_product()) : woocommerce_content(); else : ?>
<div class="fcc-wc-layout"><aside class="fcc-filter-box" aria-label="Product search and categories">
<?php get_product_search_form(); ?><h2>Categories</h2>
<a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>">All products</a>
<?php
$categories = get_terms(array('taxonomy' => 'product_cat', 'hide_empty' => true));
if (!is_wp_error($categories)) foreach ($categories as $category) {
    $url = get_term_link($category);
    if (is_wp_error($url)) continue;
    echo '<a href="' . esc_url($url) . '"' . (is_product_category($category->slug) ? ' aria-current="page"' : '') . '>' . esc_html($category->name) . '</a>';
}
?></aside><div class="fcc-wc-results"><?php woocommerce_content(); ?></div></div>
<?php endif; ?></main><?php get_footer(); ?>
