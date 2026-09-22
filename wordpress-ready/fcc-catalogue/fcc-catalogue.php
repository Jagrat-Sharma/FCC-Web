<?php
/**
 * Plugin Name: First Choice Catalogue
 * Description: Keeps WooCommerce in enquiry-only mode and adds product email enquiries.
 * Version: 1.0.0
 * Requires PHP: 7.4
 */
defined('ABSPATH') || exit;
add_filter('woocommerce_is_purchasable', '__return_false', 99);
add_filter('woocommerce_variation_is_purchasable', '__return_false', 99);
add_filter('woocommerce_add_to_cart_validation', '__return_false', 99);
add_filter('woocommerce_get_price_html', '__return_empty_string', 99);
add_action('wp', function () {
    remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30);
    remove_action('woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart', 10);
});
add_action('woocommerce_single_product_summary', function () {
    global $product;
    if (!$product) return;
    $subject = 'Flooring enquiry: ' . $product->get_name();
    $body = 'I would like more information about ' . $product->get_name() . "\n" . get_permalink($product->get_id()) . "\n\nMy project details:\n";
    $url = 'mailto:firstchoicecarpets@hotmail.com?subject=' . rawurlencode($subject) . '&body=' . rawurlencode($body);
    echo '<p><a class="fcc-button" href="' . esc_url($url) . '">Enquire about this product</a></p><p>Opens your email app. Or call <a href="tel:+19054585555">905-458-5555</a>.</p>';
}, 30);
add_action('template_redirect', function () {
    if (function_exists('is_cart') && (is_cart() || is_checkout())) {
        wp_safe_redirect(wc_get_page_permalink('shop'));
        exit;
    }
});
