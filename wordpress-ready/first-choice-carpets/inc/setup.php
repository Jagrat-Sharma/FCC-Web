<?php
defined('ABSPATH') || exit;
add_action('admin_menu', function () {
    add_theme_page('First Choice setup', 'First Choice setup', 'manage_options', 'fcc-setup', 'fcc_setup_screen');
});
function fcc_setup_screen() {
    if (!current_user_can('manage_options')) return;
    ?><div class="wrap"><h1>First Choice Carpets setup</h1>
    <p>Create draft pages and flooring categories. Existing pages and products are not overwritten. No sample products are imported.</p>
    <p>Install and activate WooCommerce first. After creating drafts, review and publish them, choose Home under Settings → Reading, and choose Products as the shop page under WooCommerce → Settings → Products.</p>
    <p>Activate the separate First Choice Catalogue plugin to disable purchases and display product enquiry links.</p>
    <?php if (isset($_GET['fcc_done'])) : ?><div class="notice notice-success"><p>Setup finished. Review your pages and product categories. Existing content was preserved.</p></div><?php endif; ?>
    <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
    <input type="hidden" name="action" value="fcc_create_pages">
    <?php wp_nonce_field('fcc_create_pages'); submit_button('Create missing draft pages and categories'); ?>
    </form></div><?php
}
add_action('admin_post_fcc_create_pages', function () {
    if (!current_user_can('manage_options')) wp_die('Permission denied.');
    check_admin_referer('fcc_create_pages');
    if (!class_exists('WooCommerce')) wp_die('Activate WooCommerce first, then run setup again.');
    $pages = array('home' => 'Home', 'products' => 'Products', 'about' => 'About Us', 'gallery' => 'Gallery', 'contact' => 'Contact', 'faq' => 'FAQ');
    $ids = array();
    foreach ($pages as $slug => $title) {
        $existing = get_page_by_path($slug);
        if ($existing) { $ids[$slug] = $existing->ID; continue; }
        $id = wp_insert_post(array('post_type' => 'page', 'post_status' => 'draft', 'post_name' => $slug, 'post_title' => $title), true);
        if (is_wp_error($id)) wp_die(esc_html($id->get_error_message()));
        $ids[$slug] = $id;
        update_post_meta($id, '_fcc_seed_pending', '1');
    }
    foreach ($ids as $slug => $id) {
        if (!get_post_meta($id, '_fcc_seed_pending', true)) continue;
        $file = get_theme_file_path('/seed/' . $slug . '.html');
        if (!is_readable($file)) continue;
        $content = file_get_contents($file);
        foreach ($ids as $target => $target_id) {
            // Use final page routes, not draft preview URLs.
            $url = get_option('permalink_structure') ? home_url('/' . $target . '/') : add_query_arg('page_id', $target_id, home_url('/'));
            if ($target === 'home') $url = home_url('/');
            $content = str_replace('{{' . $target . '}}', esc_url($url), $content);
        }
        $content = preg_replace_callback('/\{\{category:([a-z0-9-]+)\}\}/', function ($m) use ($ids) {
            return esc_url(fcc_category_url($m[1]));
        }, $content);
        $result = wp_update_post(wp_slash(array('ID' => $id, 'post_content' => $content)), true);
        if (is_wp_error($result)) wp_die(esc_html($result->get_error_message()));
        delete_post_meta($id, '_fcc_seed_pending');
    }
    $categories = array('carpet' => 'Carpet', 'carpet-tiles' => 'Carpet Tiles', 'engineered-hardwood' => 'Engineered Hardwood', 'laminate' => 'Laminate Flooring', 'solid-hardwood' => 'Solid Hardwood', 'vinyl' => 'Vinyl Flooring', 'tiles' => 'Tiles', 'accessories' => 'Accessories');
    foreach ($categories as $slug => $name) {
        if (!get_term_by('slug', $slug, 'product_cat')) {
            $term = wp_insert_term($name, 'product_cat', array('slug' => $slug));
            if (is_wp_error($term)) wp_die(esc_html($term->get_error_message()));
        }
    }
    foreach (array('brand' => 'Brand', 'thickness' => 'Thickness') as $slug => $label) {
        if (!wc_attribute_taxonomy_id_by_name($slug)) {
            $attribute = wc_create_attribute(array('name' => $label, 'slug' => $slug, 'type' => 'select', 'order_by' => 'name', 'has_archives' => false));
            if (is_wp_error($attribute)) wp_die(esc_html($attribute->get_error_message()));
        }
    }
    wp_safe_redirect(admin_url('themes.php?page=fcc-setup&fcc_done=1'));
    exit;
});
