<?php

class Mai_Comment_Filter_Display {

	protected $count;

	function __construct() {
		$this->count = 1;
		$this->hooks();
	}

	function hooks() {
		add_action( 'wp_enqueue_scripts',      array( $this, 'enqueue' ) );
		add_action( 'genesis_before_comments', array( $this, 'add_pie_filter' ) );
		add_action( 'genesis_before_comment',  array( $this, 'comment_number' ) );
		add_filter( 'genesis_attr_comment',    array( $this, 'comment_attributes' ) );
	}

	function enqueue() {
		$suffix = $this->get_suffix();
		wp_enqueue_style( 'mai-comment-filter',      MAI_COMMENT_PIE_FILTER_PLUGIN_URL . "assets/css/mai-comment-filter{$suffix}.css", array(), MAI_COMMENT_PIE_FILTER_VERSION );
		wp_enqueue_script( 'list-js',                MAI_COMMENT_PIE_FILTER_PLUGIN_URL . "assets/js/list{$suffix}.js", array( 'jquery' ), '1.5.0', true );
		wp_enqueue_script( 'localforage',            MAI_COMMENT_PIE_FILTER_PLUGIN_URL . "assets/js/localforage{$suffix}.js", array( 'jquery' ), '1.7.3', true );
		wp_enqueue_script( 'jquery-accessible-tabs', MAI_COMMENT_PIE_FILTER_PLUGIN_URL . "assets/js/jquery-accessible-tabs{$suffix}.js", array( 'jquery' ), MAI_COMMENT_PIE_FILTER_VERSION, true );
		wp_enqueue_script( 'mai-comment-filter',     MAI_COMMENT_PIE_FILTER_PLUGIN_URL . "assets/js/mai-comment-filter{$suffix}.js", array( 'localforage' ), MAI_COMMENT_PIE_FILTER_VERSION, true );
		wp_localize_script( 'mai-comment-filter', 'commentFilterVars', array(
			'images' => $this->get_images(),
			'quotes' => $this->get_quotes(),
		) );
	}

	/**
	 * Helper function for getting the script/style `.min` suffix for minified files.
	 *
	 * @since   0.8.0
	 *
	 * @return  string
	 */
	function get_suffix() {
		$debug = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG;
		return $debug ? '' : '.min';
	}

	function get_images() {
		$images = array();
		if ( ! function_exists( 'get_field' ) ) {
			return $images;
		}
		$data = get_field( 'comment_filter_images', 'option' );
		if ( ! $data ) {
			return;
		}
		foreach( $data as $image_id ) {
			$images[] = wp_get_attachment_image( $image_id, 'thumbnail' );
		}
		$images = array_filter( $images );
		$images = array_unique( $images );
		shuffle( $images );
		return $images;
	}

	function get_quotes() {
		$quotes = array();
		if ( ! function_exists( 'get_field' ) ) {
			return $quotes;
		}
		$data = get_field( 'comment_filter_quotes', 'option' );
		if ( ! $data ) {
			return;
		}
		$data   = trim( $data );
		$quotes = explode( "\n", $data );
		$quotes = array_map( 'trim', $quotes );
		$quotes = array_filter( $quotes );
		$quotes = array_unique( $quotes );
		shuffle( $quotes );
		return $quotes;
	}

	function add_pie_filter() {
		?>
		<div class="pie-filter js-tabs" data-tabs-disable-fragment="1">
			<ul class="js-tablist">
				<li class="js-tablist__item">
					<a href="#cf-commenter-content" class="js-tablist__link">Pie Filter</a>
				</li>
				<li class="js-tablist__item">
					<a href="#cf-pied-content" class="js-tablist__link">Pied List</a>
				</li>
				<li class="js-tablist__item">
					<a href="#cf-settings-content" class="js-tablist__link">Settings</a>
				</li>
			</ul>
			<?php
			$commenters = $this->get_commenters();
			$class      = $commenters ? '' : ' cf-no-commenters';
			printf( '<div id="cf-commenter-content" class="js-tabcontent%s">', $class );
				?>
				<h3>Commenters</h3>
				<p class="cf-no-commenters-message bottom-xs-none">No commenters available.</p>
				<input class="cf-commenter-search cf-search search bottom-xs-xxs" placeholder="Search commenters..." />
				<ul class="list cf-list cf-commenter-list">
					<?php
					if ( $commenters ) {
						foreach( $commenters as $commenter ) {
							?>
							<li class="cf-list-item cf-commenter-item">
								<button class="cf-button cf-add row middle-xs">
									<?php printf( '<span class="cf-commenter col col-xs text-xs-left">%s</span>', $commenter ); ?>
									<span class="action col-xs-auto">Click to Add</span>
								</button>
							</li>
							<?php
						}
					} else {
						?>
						<li class="cf-list-item cf-commenter-item">
							<button class="cf-button cf-add row middle-xs">
								<span class="cf-commenter col col-xs text-xs-left"></span>
								<span class="action col-xs-auto">Click to Add</span>
							</button>
						</li>
						<?php
					}
					?>
				</ul>
			</div>
			<div id="cf-pied-content" class="js-tabcontent">
				<h3>Pied Commenters</h3>
				<p class="cf-no-commenters-message bottom-xs-none">No filtered commenters available.</p>
				<input class="cf-pied-search cf-search search bottom-xs-xxs" placeholder="Search pied commenters..." />
				<ul class="list cf-list cf-pied-list">
					<li class="cf-list-item cf-pied-item">
						<button class="cf-button cf-remove row middle-xs">
							<span class="cf-commenter col col-xs text-xs-left"></span>
							<span class="action col-xs-auto">Click to Remove</span>
						</button>
					</li>
				</ul>
			</div>
			<div id="cf-settings-content" class="js-tabcontent">
				<h3>Pie Settings</h3>
				<form id="cf-settings-form" class="cf-settings-form" method="post">
					<label><input type="radio" name="cf-display" value="default" checked> Hide Comment</label><br>
					<label><input type="radio" name="cf-display" value="image"> Show a random image</label><br>
					<label><input type="radio" name="cf-display" value="quote"> Show a random quote</label>
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
			$attributes['class']       = trim( $attributes['class'] . ' cf-comment-inner' );
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
	new Mai_Comment_Filter_Display;
});
