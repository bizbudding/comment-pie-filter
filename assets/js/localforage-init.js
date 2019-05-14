// Get it started.
jQuery( function($) {

	// localforage.clear();

	// var piedUsers  = [],
	var $emailForm = $( '.pf-name-form' );

	localforage.getItem( 'piedUsers' ).then( function( value ) {

		var piedUsers = value ? value : [];

		displayPiedUsers();
		hidePiedUsers();

		// Form submitted.
		$emailForm.on( 'submit', function( e ) {

			e.preventDefault();

			// Get name input.
			var name = $(this).find( '[name="pf-name"]' );

			if ( ! name.length ) {
				return;
			}

			// Get escaped name.
			var name = getEscaped( name.val() );

			if ( ! name.length ) {
				return;
			}

			// Add new user to our array.
			piedUsers.push( name );

			// Make the array unique.
			piedUsers = piedUsers.filter( makeUnique );

			// Save the new array in storage.
			localforage.setItem( 'piedUsers', piedUsers );

			console.log( piedUsers );
		});

	});

	function displayPiedUsers() {
		localforage.getItem( 'piedUsers' ).then( function( value ) {
			// console.log( value );
			for ( var i = 0; i < value.length; i++ ) {
				$emailForm.append( '<div>' + value[i] + '</div>' );
			}
		});
	}

	function hidePiedUsers() {
		localforage.getItem( 'piedUsers' ).then( function( value ) {
			hideUsers( value );
		});
	}

	function hideUsers( value = [] ) {
		var $users = value;
		if ( ! $users.length ) {
			return;
		}
		var $names = $( '.comment-author-name' );
		if ( ! $names.length ) {
			return;
		}
		$.each( $names, function( index, value ) {
			// Get the name.
			var $name = $(this).text();
			// console.log( $name );
			// Skip if not pied.
			if ( ! $users.includes( $name ) ) {
				return;
			}
			$(this).parents( 'li.comment' ).find( '.comment-content' ).css({ 'opacity' : '.5' });
		});
	}

	function getEscaped( string ) {
		var div = document.createElement( 'div' );
		div.appendChild( document.createTextNode( string ) );
		return div.innerHTML;
	}

	/**
	 *
	 * Use:
	 * myArray.filter( makeUnique );
	 */
	function makeUnique( value, index, self ) {
		return self.indexOf(value) === index;
	}

	// localforage.getItem( 'piedUsers', function( err, value ) {

	// 	if ( ! value ) {
	// 		return;
	// 	}



	// 	// Run this code once the value has been
	// 	// loaded from the offline store.
	// 	// console.log( value );
	// });

});
