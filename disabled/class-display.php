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
		// wp_enqueue_style( 'chosen', COMMENT_PIE_FILTER_PLUGIN_URL . 'vendor/harvesthq/chosen/chosen.min.css', array(), '1.8.7' );
		// wp_enqueue_script( 'chosen', COMMENT_PIE_FILTER_PLUGIN_URL . 'vendor/harvesthq/chosen/chosen.jquery.min.js', array( 'jquery' ), '1.8.7', true );
		// wp_enqueue_style( 'choices-base', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/css/choices-base.min.css', array(), '7.0.0' );
		// wp_enqueue_style( 'choices', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/css/choices.min.css', array(), '7.0.0' );
		// wp_enqueue_script( 'choices', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/choices.min.js', array( 'jquery' ), '7.0.0', true );
		// wp_enqueue_style( 'selectize', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/css/selectize.css', array(), '0.12.4' );
		// wp_enqueue_style( 'selectize-default', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/css/selectize.default.css', array(), '0.12.4' );
		// wp_enqueue_script( 'selectize', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/selectize.min.js', array( 'jquery' ), '0.12.4', true );
		wp_enqueue_script( 'list-js', '//cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.min.js', array( 'jquery' ), '1.5.0', true );
		wp_enqueue_script( 'localforage', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/localforage.js', array( 'jquery' ), '1.7.3', true );
		wp_enqueue_script( 'jquery-accessible-tabs', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/jquery-accessible-tabs.js', array( 'jquery' ), COMMENT_PIE_FILTER_VERSION, true );
		wp_enqueue_script( 'comment-pie-filter', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/comment-pie-filter.js', array( 'localforage' ), COMMENT_PIE_FILTER_VERSION, true );
		// wp_localize_script( 'script-name', 'prefix_script_vars', array(
		// 	'search_btn' => inforelay_get_search_btn(),
		// 	'search_box' => inforelay_get_search_box(),
		// ) );
	}

	function add_pie_filter() {
		?>
		<div class="pie-filter js-tabs" data-tabs-disable-fragment="1">
			<ul class="js-tablist">
				<li class="js-tablist__item">
					<a href="#pf-form-content" class="js-tablist__link">Pie Filter</a>
				</li>
				<li class="js-tablist__item">
					<a href="#pf-list-content" class="js-tablist__link">Pied List</a>
				</li>
				<li class="js-tablist__item">
					<a href="#pf-settings-content" class="js-tablist__link">Settings</a>
				</li>
			</ul>
			<div id="pf-form-content" class="js-tabcontent">
				<form class="pf-name-form" method="post">
					<div class="row gutter-xs middle-xs">
						<div class="col col-xs-12 col-sm-8 bottom-xs-xs bottom-sm-none">
							<select class="pf-name" name="pf-name" required>
								<?php
								$commenters = $this->get_commenters();
								if ( $commenters ) {
									echo '<option placeholder>Select a commenter...</option>';
									foreach( $commenters as $commenter ) {
										printf( '<option value="%1$s">%1$s</option>', $commenter );
									}
								} else {
									echo '<option placeholder>This post does not have comments yet...</option>';
								}
								?>
							</select>
						</div>
						<div class="col col-xs-12 col-sm-auto">
							<!-- <input class="pf-name-submit" type="submit" value="Add To List" disabled> -->
							<input class="pf-name-submit" type="submit" value="Add To List">
						</div>
					</div>
				</form>
			</div>
			<div id="pf-list-content" class="js-tabcontent">
				<ul class="pf-list">
					<li>You do not have any commenters filtered at this time.</li>
				</ul>
			</div>
			<div id="pf-settings-content" class="js-tabcontent">
				<form class="pf-settings-form" method="post">
					<select name="pf-settings" required>
						<option value="" placeholder>Select a commenter...</option>
					</select>
					<input class="pf-settings-submit" type="submit" value="Submit">
				</form>
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

	function get_commenters() {
		// Get approved comments of this post.
		$comments = get_comments( array(
			'post_id' => get_the_ID(),
			'status'  => 'approve',
		) );
		// Bail if no comments.
		if ( ! $comments ) {
			return false;
		}
		// Get authors as array.
		$comments = wp_list_pluck( $comments, 'comment_author' );
		$comments = array_unique( $comments );
		// Bail if no comments.
		if ( ! $comments ) {
			return false;
		}
		// Got em.
		return $comments;
	}

}

add_action( 'genesis_setup', function() {
	new Comment_Pie_Filter_Display;
});
