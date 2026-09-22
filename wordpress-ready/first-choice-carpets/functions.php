<?php
defined('ABSPATH') || exit;
require_once __DIR__ . '/inc/setup.php';
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo', array('width' => 343, 'height' => 110, 'flex-width' => true, 'flex-height' => true));
    add_theme_support('html5', array('search-form', 'gallery', 'caption', 'style', 'script'));
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-lightbox');
});
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('fcc-design', get_theme_file_uri('/assets/styles.css'), array(), filemtime(__DIR__ . '/assets/styles.css'));
    wp_enqueue_style('fcc-wordpress', get_stylesheet_uri(), array('fcc-design'), filemtime(__DIR__ . '/style.css'));
    wp_enqueue_script('fcc-navigation', get_theme_file_uri('/assets/navigation.js'), array(), filemtime(__DIR__ . '/assets/navigation.js'), true);
});
function fcc_page_url($slug) {
    if ($slug === 'home') return home_url('/');
    if ($slug === 'products' && function_exists('wc_get_page_permalink')) {
        $url = wc_get_page_permalink('shop');
        if ($url && wc_get_page_id('shop') > 0) return $url;
    }
    $page = get_page_by_path($slug);
    return $page ? get_permalink($page) : home_url('/' . $slug . '/');
}
function fcc_logo() {
    if (has_custom_logo()) { the_custom_logo(); return; }
    echo '<a class="fcc-brand" href="' . esc_url(home_url('/')) . '"><img class="fcc-logo" src="' . esc_url(get_theme_file_uri('/assets/first-choice-logo-trimmed.png')) . '" alt="First Choice — 416-245-4444" width="2172" height="724"></a>';
}
function fcc_category_url($slug) {
    $term = get_term_by('slug', $slug, 'product_cat');
    if ($term && !is_wp_error($term)) {
        $url = get_term_link($term);
        if (!is_wp_error($url)) return $url;
    }
    return fcc_page_url('products');
}
function fcc_map() {
    $address = '40 Maritime Ontario Blvd, Brampton, ON L6S 0E7';
    return '<div class="fcc-location"><h3>Location</h3><iframe title="First Choice Carpets location in Brampton" src="' . esc_url('https://maps.google.com/maps?q=' . rawurlencode($address) . '&z=16&output=embed') . '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><a target="_blank" rel="noopener noreferrer" href="' . esc_url('https://www.google.com/maps/search/?api=1&query=' . rawurlencode($address)) . '">View map and directions</a></div>';
}
add_shortcode('fcc_map', 'fcc_map');
add_action('wp', function () {
    if (!class_exists('WooCommerce')) return;
    remove_action('woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart', 10);
    add_action('woocommerce_after_shop_loop_item', function () {
        echo '<a class="button" href="' . esc_url(get_permalink()) . '">View details</a>';
    }, 10);
});
add_filter('loop_shop_columns', function () { return 3; });
add_filter('loop_shop_per_page', function () { return 12; });
