<?php

class Comment_Pie_Filter_Display {

	protected $count;

	function __construct() {
		$this->count = 1;
		$this->hooks();
	}

	function hooks() {
		add_action( 'wp_enqueue_scripts',               array( $this, 'enqueue' ) );
		add_action( 'genesis_before_comments',          array( $this, 'add_pie_filter' ) );
		add_action( 'genesis_before_comment',           array( $this, 'comment_number' ) );
		add_filter( 'genesis_attr_comment-author-name', array( $this, 'comment_attributes' ) );
	}

	function enqueue() {
		wp_enqueue_style( 'comment-pie-filter', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/css/comment-pie-filter.css', array(), COMMENT_PIE_FILTER_VERSION );
		// wp_enqueue_style( 'choices-base', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/css/choices-base.min.css', array(), '7.0.0' );
		wp_enqueue_style( 'choices', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/css/choices.min.css', array(), '7.0.0' );
		wp_enqueue_script( 'choices', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/choices.min.js', array( 'jquery' ), '7.0.0', true );
		wp_enqueue_script( 'jquery-accessible-tabs', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/jquery-accessible-tabs.js', array( 'jquery' ), COMMENT_PIE_FILTER_VERSION, true );
		wp_enqueue_script( 'localforage', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/localforage.js', array( 'jquery' ), COMMENT_PIE_FILTER_VERSION, true );
		wp_enqueue_script( 'localforage-init', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/localforage-init.js', array( 'localforage' ), COMMENT_PIE_FILTER_VERSION, true );
		// wp_localize_script( 'script-name', 'prefix_script_vars', array(
		// 	'search_btn' => inforelay_get_search_btn(),
		// 	'search_box' => inforelay_get_search_box(),
		// ) );
	}

	function add_pie_filter() {
		?>
		<div class="pie-filter js-tabs">
			<ul class="js-tablist">
				<li class="js-tablist__item">
					<a href="#pf-form-content" class="js-tablist__link">Pie Filter</a>
				</li>
				<li class="js-tablist__item">
					<a href="#pf-list-content" class="js-tablist__link">Pied List</a>
				</li>
			</ul>
			<div id="pf-form-content" class="js-tabcontent">
				<form class="pf-name-form" method="post">
					<select name="pf-name" placeholder="Enter commenter name" value="" required>
						<option placeholder>Select a commenter...</option>
					</select>
					<input class="pf-name-submit" type="submit" value="Submit">
				</form>
			</div>
			<div id="pf-list-content" class="js-tabcontent">
				<ul class="pf-list">
				</ul>
			</div>
		</div>
		<?php
	}

	function comment_number() {
		printf( '<div class="comment-count" data-count="%1$s">%1$s.</div>', $this->count );
		$this->count++;
	}

	function comment_attributes( $attributes ) {
		$comment_id = get_comment_ID();
		$comment    = get_comment( $comment_id );
		if ( $comment ) {
			$attributes['data-name'] = esc_html( $comment->comment_author );
		}
		return $attributes;
	}

}

add_action( 'genesis_setup', function() {
	new Comment_Pie_Filter_Display;
});
