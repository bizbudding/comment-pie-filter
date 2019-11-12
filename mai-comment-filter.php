<?php

/**
 * Plugin Name:     Mai Comment Filter
 * Plugin URI:      https://bizbudding.com
 * Description:     Core funtionality for bizbudding.com
 * Version:         0.5.2
 *
 * Author:          BizBudding, Mike Hemberger
 * Author URI:      https://bizbudding.com
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Main Mai_Comment_Filter Class.
 *
 * @since 0.1.0
 */
final class Mai_Comment_Filter {

	/**
	 * @var   Mai_Comment_Filter The one true Mai_Comment_Filter
	 * @since 0.1.0
	 */
	private static $instance;

	/**
	 * Main Mai_Comment_Filter Instance.
	 *
	 * Insures that only one instance of Mai_Comment_Filter exists in memory at any one
	 * time. Also prevents needing to define globals all over the place.
	 *
	 * @since   0.1.0
	 * @static  var array $instance
	 * @uses    Mai_Comment_Filter::setup_constants() Setup the constants needed.
	 * @uses    Mai_Comment_Filter::includes() Include the required files.
	 * @uses    Mai_Comment_Filter::hooks() Activate, deactivate, etc.
	 * @see     Mai_Comment_Filter()
	 * @return  object | Mai_Comment_Filter The one true Mai_Comment_Filter
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) ) {
			// Setup the setup
			self::$instance = new Mai_Comment_Filter;
			// Methods
			self::$instance->setup_constants();
			self::$instance->includes();
			self::$instance->hooks();
		}
		return self::$instance;
	}

	/**
	 * Throw error on object clone.
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @since   0.1.0
	 * @access  protected
	 * @return  void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'mai-comment-filter' ), '1.0' );
	}

	/**
	 * Disable unserializing of the class.
	 *
	 * @since   0.1.0
	 * @access  protected
	 * @return  void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'mai-comment-filter' ), '1.0' );
	}

	/**
	 * Setup plugin constants.
	 *
	 * @access  private
	 * @since   0.1.0
	 * @return  void
	 */
	private function setup_constants() {

		// Plugin version.
		if ( ! defined( 'MAI_COMMENT_FILTER_VERSION' ) ) {
			define( 'MAI_COMMENT_FILTER_VERSION', '0.5.2' );
		}

		// Plugin Folder Path.
		if ( ! defined( 'MAI_COMMENT_FILTER_PLUGIN_DIR' ) ) {
			define( 'MAI_COMMENT_FILTER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
		}

		// Plugin Includes Path.
		if ( ! defined( 'MAI_COMMENT_FILTER_INCLUDES_DIR' ) ) {
			define( 'MAI_COMMENT_FILTER_INCLUDES_DIR', MAI_COMMENT_FILTER_PLUGIN_DIR . 'includes/' );
		}

		// Plugin Folder URL.
		if ( ! defined( 'MAI_COMMENT_FILTER_PLUGIN_URL' ) ) {
			define( 'MAI_COMMENT_FILTER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
		}

		// Plugin Root File.
		if ( ! defined( 'MAI_COMMENT_FILTER_PLUGIN_FILE' ) ) {
			define( 'MAI_COMMENT_FILTER_PLUGIN_FILE', __FILE__ );
		}

		// Plugin Base Name.
		if ( ! defined( 'MAI_COMMENT_FILTER_BASENAME' ) ) {
			define( 'MAI_COMMENT_FILTER_BASENAME', dirname( plugin_basename( __FILE__ ) ) );
		}

	}

	/**
	 * Include required files.
	 *
	 * @access  private
	 * @since   0.1.0
	 * @return  void
	 */
	private function includes() {
		// Include vendor libraries.
		require_once __DIR__ . '/vendor/autoload.php';
		// Includes.
		foreach ( glob( MAI_COMMENT_FILTER_INCLUDES_DIR . '*.php' ) as $file ) { include $file; }
	}

	/**
	 * Run the hooks.
	 *
	 * @since   0.1.0
	 * @return  void
	 */
	public function hooks() {
		add_action( 'admin_init', array( $this, 'updater' ) );
	}

	/**
	 * Setup the updater.
	 *
	 * composer require yahnis-elsts/plugin-update-checker
	 *
	 * @uses    https://github.com/YahnisElsts/plugin-update-checker/
	 *
	 * @return  void
	 */
	public function updater() {

		// Bail if current user cannot manage plugins.
		if ( ! current_user_can( 'install_plugins' ) ) {
			return;
		}

		// Bail if plugin updater is not loaded.
		if ( ! class_exists( 'Puc_v4_Factory' ) ) {
			return;
		}

		// Setup the updater.
		$updater = Puc_v4_Factory::buildUpdateChecker( 'https://github.com/maithemewp/mai-comment-filter/', __FILE__, 'mai-comment-filter' );
	}

	/**
	 * Get the default setting options.
	 *
	 * @since   0.3.0
	 *
	 * @return  array  The settings options.
	 */
	public function get_setting_options() {
		return array(
			'hide'  => 'Hide comment',
			'image' => 'Show a random image',
			'quote' => 'Show a random quote',
		);
	}

}

/**
 * The main function for that returns Mai_Comment_Filter
 *
 * The main function responsible for returning the one true Mai_Comment_Filter
 * Instance to functions everywhere.
 *
 * Use this function like you would a global variable, except without needing
 * to declare the global.
 *
 * Example: <?php $plugin = mai_comment_filter(); ?>
 *
 * @since 0.1.0
 *
 * @return object|Mai_Comment_Filter The one true Mai_Comment_Filter Instance.
 */
function mai_comment_filter() {
	return Mai_Comment_Filter::instance();
}

// Get Mai_Comment_Filter Running.
mai_comment_filter();
