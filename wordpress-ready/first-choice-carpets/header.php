<?php defined('ABSPATH') || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>><?php wp_body_open(); ?>
<div class="fcc" id="fcc-home">
<a class="fcc-skip" href="#fcc-main">Skip to content</a>
<div class="fcc-topbar"><span>Serving Toronto, Ontario</span></div>
<header class="fcc-header"><?php fcc_logo(); ?>
<nav aria-label="Main navigation">
<?php if (!is_front_page()) : ?><a href="<?php echo esc_url(home_url('/')); ?>">Home</a><?php endif; ?>
<details class="fcc-products-menu"><summary>Products <span aria-hidden="true">⌄</span></summary>
<div class="fcc-mega fcc-flyout"><div class="fcc-category-list">
<?php
$categories = taxonomy_exists('product_cat') ? get_terms(array('taxonomy' => 'product_cat', 'hide_empty' => false, 'parent' => 0, 'exclude' => array((int) get_option('default_product_cat')))) : array();
if (!is_wp_error($categories)) : foreach ($categories as $i => $category) :
$url = get_term_link($category);
if (is_wp_error($url)) continue;
?>
<details class="fcc-category-menu" <?php echo $i === 0 ? 'open' : ''; ?>><summary><?php echo esc_html($category->name); ?><span class="fcc-sub-chevron" aria-hidden="true"></span></summary>
<div class="fcc-submenu"><p class="fcc-eyebrow"><?php echo esc_html($category->name); ?></p><div class="fcc-submenu-fields">
<?php
// Global WooCommerce attributes power real filters, not hardcoded options.
$fields = array('pa_brand' => 'Brands');
if (in_array($category->slug, array('engineered-hardwood', 'laminate', 'solid-hardwood', 'vinyl'), true)) $fields['pa_thickness'] = 'Thickness';
foreach ($fields as $taxonomy => $label) :
$terms = taxonomy_exists($taxonomy) ? get_terms(array('taxonomy' => $taxonomy, 'hide_empty' => true)) : array();
?><div><h3><?php echo esc_html($label); ?></h3><?php
if (!is_wp_error($terms) && $terms) : foreach ($terms as $term) :
$filter_url = add_query_arg('filter_' . substr($taxonomy, 3), $term->slug, $url);
?><a class="fcc-attribute-link" href="<?php echo esc_url($filter_url); ?>"><?php echo esc_html($term->name); ?></a><?php
endforeach; else : ?><p>Contact us for available options.</p><?php endif; ?></div><?php endforeach; ?>
</div><a class="fcc-text-link" href="<?php echo esc_url($url); ?>">View all <?php echo esc_html($category->name); ?></a></div></details>
<?php endforeach; endif; ?>
</div><div class="fcc-mega-footer"><a class="fcc-text-link" href="<?php echo esc_url(fcc_page_url('products')); ?>" <?php if (function_exists('is_woocommerce') && is_woocommerce()) echo 'aria-current="page"'; ?>>View all products</a></div></div></details>
<?php foreach (array('about' => 'About Us', 'gallery' => 'Gallery', 'faq' => 'FAQ', 'contact' => 'Contact') as $slug => $label) : ?>
<a <?php if ($slug === 'contact') echo 'class="fcc-button fcc-button-small"'; ?> href="<?php echo esc_url(fcc_page_url($slug)); ?>" <?php if (is_page($slug)) echo 'aria-current="page"'; ?>><?php echo esc_html($label); ?></a>
<?php endforeach; ?>
</nav></header>
