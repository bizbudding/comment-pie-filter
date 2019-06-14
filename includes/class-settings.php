<?php

class Mai_Comment_Filter_Settings {

	function __construct() {
		$this->hooks();
	}

	function hooks() {

		add_filter( 'acf/settings/load_json', array( $this, 'load_json' ) );

		if ( function_exists('acf_add_options_page') ) {
			acf_add_options_sub_page( array(
				'title'      => 'Comment Filter',
				'parent'     => 'options-general.php',
				'menu_slug'  => 'comment_filter',
				'capability' => 'manage_options'
			));
		}
	}

	/**
	 * Add path to load acf json files.
	 *
	 * @param    array  The existing acf-json paths.
	 *
	 * @return   array  The modified paths.
	 */
	function load_json( $paths ) {
		$paths[] = untrailingslashit( MAI_COMMENT_PIE_FILTER_PLUGIN_DIR ) . '/acf-json';
		return $paths;
	}

}

new Mai_Comment_Filter_Settings;
