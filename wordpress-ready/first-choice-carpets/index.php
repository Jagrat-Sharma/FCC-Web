<?php defined('ABSPATH') || exit; get_header(); ?>
<main id="fcc-main" class="fcc-section">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
<article><h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1><?php the_content(); ?></article>
<?php endwhile; the_posts_pagination(); else : ?>
<h1>Welcome to First Choice Carpets</h1><p>Our website content is being prepared.</p>
<?php endif; ?></main><?php get_footer(); ?>
