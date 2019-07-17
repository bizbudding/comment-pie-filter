<?php

class Mai_Comment_Filter_Display {

	protected $count;

	function __construct() {
		$this->hooks();
	}

	function hooks() {
		add_action( 'wp_enqueue_scripts',      array( $this, 'enqueue' ) );
		add_action( 'genesis_before_comments', array( $this, 'add_comment_filter' ) );
		add_filter( 'genesis_attr_comment',    array( $this, 'comment_attributes' ) );
	}

	function enqueue() {
		$suffix = $this->get_suffix();
		wp_enqueue_style( 'mai-comment-filter',      MAI_COMMENT_FILTER_PLUGIN_URL . "assets/css/mai-comment-filter{$suffix}.css", array(), MAI_COMMENT_FILTER_VERSION );
		wp_enqueue_script( 'jquery-accessible-tabs', MAI_COMMENT_FILTER_PLUGIN_URL . "assets/js/jquery-accessible-tabs.min.js", array( 'jquery' ), MAI_COMMENT_FILTER_VERSION, true );
		wp_enqueue_script( 'jets-js',                MAI_COMMENT_FILTER_PLUGIN_URL . "assets/js/jets{$suffix}.js", array( 'jquery' ), '0.14.1', true );
		wp_enqueue_script( 'localforage',            MAI_COMMENT_FILTER_PLUGIN_URL . "assets/js/localforage.min.js", array( 'jquery' ), '1.7.3', true );
		wp_enqueue_script( 'mai-comment-filter',     MAI_COMMENT_FILTER_PLUGIN_URL . "assets/js/mai-comment-filter{$suffix}.js", array( 'jets-js', 'localforage', 'jquery' ), MAI_COMMENT_FILTER_VERSION, true );
		wp_localize_script( 'mai-comment-filter',    'commentFilterVars', array(
			'images'     => $this->get_images(),
			'quotes'     => $this->get_quotes(),
			'textAdd'    => $this->get_add_text(),
			'textRemove' => $this->get_remove_text(),
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

	function get_add_text() {
		return __( 'Click to Add', 'mai-comment-filter' );
	}

	function get_remove_text() {
		return __( 'Click to Remove', 'mai-comment-filter' );
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

	function get_default_setting() {
		$default = 'hide';
		if ( ! function_exists( 'get_field' ) ) {
			return $default;
		}
		$setting = get_field( 'comment_filter_default_setting', 'option' );
		return $setting ? $setting : $default;
	}

	function add_comment_filter() {
		?>
		<div class="cf-filter js-tabs" data-tabs-disable-fragment="1">
			<ul class="js-tablist">
				<li class="js-tablist__item">
					<a href="#cf-commenter-content" class="js-tablist__link">Commenters</a>
				</li>
				<li class="js-tablist__item">
					<a href="#cf-filtered-content" class="js-tablist__link">Filtered</a>
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
				<input id="jetsCommenterSearch" class="cf-commenter-search cf-search search bottom-xs-xxs" placeholder="Search commenters..." />
				<ul id="jetsCommenterList" class="list cf-list cf-commenter-list">
					<?php
					if ( $commenters ) {
						foreach( $commenters as $commenter ) {
							printf( '<li class="cf-list-item cf-commenter-item cfAdd" data-action="%s">%s</li>', $this->get_add_text(), $commenter );
						}
					}
					?>
				</ul>
			</div>
			<div id="cf-filtered-content" class="js-tabcontent">
				<h3>Filtered Commenters</h3>
				<p class="cf-no-commenters-message bottom-xs-none">No filtered commenters available.</p>
				<input id="jetsFilteredSearch" class="cf-filtered-search cf-search search bottom-xs-xxs" placeholder="Search filtered commenters..." />
				<ul id="jetsFilteredList" class="list cf-list cf-pied-list"></ul>
			</div>
			<div id="cf-settings-content" class="js-tabcontent">
				<h3>Settings</h3>
				<form id="cf-settings-form" class="cf-settings-form" method="post">
					<?php
					$settings = mai_comment_filter()->get_settings_options();
					foreach ( mai_comment_filter()->get_settings_options() as $value => $label ) {
						$checked = ( $value === $this->get_default_setting() ) ? ' checked' : '';
						printf( '<label><input type="radio" name="cf-display" value="%s"%s> %s</label><br>', $value, $checked, $label );
					}
					?>
				</form>
			</div>
		</div>
		<?php
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

// Get it started.
add_action( 'wp', function() {
	// Bail if not running Genesis.
	if ( 'genesis' !== wp_get_theme()->template ) {
		return;
	}
	// Bail if not a single post/page/cpt.
	if ( ! is_singular() ) {
		return;
	}
	// Bail if comments are not open.
	if ( ! comments_open( get_the_ID() ) ) {
		return;
	}
	// Display.
	maicf_display();
});

// Function to initiate the class.
function maicf_display() {
	new Mai_Comment_Filter_Display;
}
