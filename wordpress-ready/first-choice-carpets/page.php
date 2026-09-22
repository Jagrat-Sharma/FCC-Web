<?php defined('ABSPATH') || exit; get_header(); ?>
<main id="fcc-main">
<?php while (have_posts()) : the_post();
if (post_password_required()) { echo get_the_password_form(); }
else { the_content(); }
endwhile; ?>
</main>
<?php get_footer(); ?>
