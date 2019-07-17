<?php

class Mai_Comment_Filter_Settings {

	function __construct() {
		$this->hooks();
	}

	function hooks() {

		add_filter( 'acf/settings/load_json',                 array( $this, 'load_json' ) );
		add_filter( 'acf/load_field/key=field_5d2e3b42d6503', array( $this, 'load_options' ) );

		if ( function_exists('acf_add_options_page') ) {
			acf_add_options_sub_page( array(
				'title'      => 'Comment Filter',
				'parent'     => 'options-general.php',
				'menu_slug'  => 'comment_filter',
				'capability' => 'manage_options'
			) );
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
		$paths[] = untrailingslashit( MAI_COMMENT_FILTER_PLUGIN_DIR ) . '/acf-json';
		return $paths;
	}

	function load_options( $field ) {
		$field['choices'] = mai_comment_filter()->get_setting_options();
		$field['default'] = 'hide';
		return $field;
	}

}

new Mai_Comment_Filter_Settings;
