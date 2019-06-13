<?php

class Comment_Pie_Filter_Settings {

	function __construct() {
		$this->hooks();
	}

	function hooks() {
		if ( function_exists('acf_add_options_page') ) {
			acf_add_options_sub_page( array(
				'title'      => 'Comment Pie Filter',
				'parent'     => 'options-general.php',
				'menu_slug'  => 'comment_pie_filter',
				'capability' => 'manage_options'
			));
		}
	}

}

new Comment_Pie_Filter_Settings;
