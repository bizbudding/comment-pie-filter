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
		add_filter( 'genesis_attr_comment',             array( $this, 'comment_attributes' ) );
		// add_filter( 'genesis_attr_comment-author-name', array( $this, 'comment_author_attributes' ) );
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
		wp_enqueue_script( 'list-js', '//cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.js', array( 'jquery' ), '1.5.0', true );
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
					<a href="#pf-commenter-content" class="js-tablist__link">Pie Filter</a>
				</li>
				<li class="js-tablist__item">
					<a href="#pf-pied-content" class="js-tablist__link">Pied List</a>
				</li>
				<li class="js-tablist__item">
					<a href="#pf-settings-content" class="js-tablist__link">Settings</a>
				</li>
			</ul>
			<?php
			$commenters = $this->get_commenters();
			$class      = $commenters ? '' : ' pf-no-commenters';
			printf( '<div id="pf-commenter-content" class="js-tabcontent%s">', $class );
				?>
				<h3>Commenters</h3>
				<p class="pf-no-commenters-message bottom-xs-none">No commenters available.</p>
				<input class="pf-commenter-search pf-search search bottom-xs-xxs" placeholder="Search commenters..." />
				<ul class="list pf-list pf-commenter-list">
					<?php
					if ( $commenters ) {
						foreach( $commenters as $commenter ) {
							?>
							<li class="pf-list-item pf-commenter-item">
								<button class="pf-button pf-add row middle-xs">
									<?php printf( '<span class="pf-commenter col col-xs text-xs-left">%s</span>', $commenter ); ?>
									<span class="action col-xs-auto">Click to Add</span>
								</button>
							</li>
							<?php
						}
					} else {
						?>
						<li class="pf-list-item pf-commenter-item">
							<button class="pf-button pf-add row middle-xs">
								<span class="pf-commenter col col-xs text-xs-left"></span>
								<span class="action col-xs-auto">Click to Add</span>
							</button>
						</li>
						<?php
					}
					?>
				</ul>
			</div>
			<div id="pf-pied-content" class="js-tabcontent">
				<h3>Pied Commenters</h3>
				<p class="pf-no-commenters-message bottom-xs-none">No filtered commenters available.</p>
				<input class="pf-pied-search pf-search search bottom-xs-xxs" placeholder="Search pied commenters..." />
				<ul class="list pf-list pf-pied-list">
					<li class="pf-list-item pf-pied-item">
						<button class="pf-button pf-remove row middle-xs">
							<span class="pf-commenter col col-xs text-xs-left"></span>
							<span class="action col-xs-auto">Click to Remove</span>
						</button>
					</li>
				</ul>
			</div>
			<div id="pf-settings-content" class="js-tabcontent">
				<h3>Pie Settings</h3>
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
			$attributes['class']       = trim( $attributes['class'] . ' pf-comment-inner' );
 			$attributes['data-id']     = esc_html( $comment->comment_ID );
 			$attributes['data-name']   = esc_html( $comment->comment_author );
			$attributes['data-parent'] = $comment->comment_parent ? absint( $comment->comment_parent ) : '00'; // genesis_attr() won't display if it's just 0.
		}
		return $attributes;
	}

	function comment_author_attributes( $attributes ) {
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
		$commenters = wp_list_pluck( $comments, 'comment_author' );
		// Remove duplicates.
		$commenters = array_unique( $commenters );
		// Bail if no commenters.
		if ( ! $commenters ) {
			return false;
		}
		// Got em.
		return $commenters;
	}

}

add_action( 'genesis_setup', function() {
	new Comment_Pie_Filter_Display;
});
