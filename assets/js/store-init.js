// Get it started.
document.addEventListener( 'DOMContentLoaded', function() {

	init()
	function init() {
		if ( ! store.enabled ) {
			alert( 'Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.' )
			return
		}
		var user = store.get( 'user' )
		console.log( user );
		// ... and so on ...
	}

});
