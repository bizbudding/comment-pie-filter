<?php

class Comment_Pie_Filter_Display {

	function __construct() {
		$this->hooks();
	}

	function hooks() {
		add_action( 'wp_enqueue_scripts',      array( $this, 'enqueue' ) );
		add_action( 'genesis_before_comments', array( $this, 'add_filter' ) );
	}

	function enqueue() {
		wp_enqueue_script( 'localforage', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/localforage.js', array( 'jquery' ), COMMENT_PIE_FILTER_VERSION, true );
		wp_enqueue_script( 'localforage-init', COMMENT_PIE_FILTER_PLUGIN_URL . 'assets/js/localforage-init.js', array( 'localforage' ), COMMENT_PIE_FILTER_VERSION, true );
		// wp_localize_script( 'script-name', 'prefix_script_vars', array(
		// 	'search_btn' => inforelay_get_search_btn(),
		// 	'search_box' => inforelay_get_search_box(),
		// ) );
	}

	function add_filter() {
		?>
		<div class="pie-filter">
			<form class="pf-name-form" method="post">
				<input type="text" name="pf-name" placeholder="Enter commenter name" value="" required>
				<input class="pf-name-submit" type="submit" value="Submit">
			</form>
			<!-- TODO: Add form by comment ID, if Greg's plugin is active. -->
		</div>
		<?php
	}

}

add_action( 'genesis_setup', function() {
	new Comment_Pie_Filter_Display;
});


// add_filter( 'get_comment', function( $_comment ) {
	// vd( $_comment );
	// return $_comment;
// });
