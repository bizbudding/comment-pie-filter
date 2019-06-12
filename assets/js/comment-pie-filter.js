// Get it started.
jQuery( function($) {

	var piedUsers         = [];
	var $commenterContent = $( '#pf-commenter-content' );
	var $piedContent      = $( '#pf-pied-content' );

	localforage.getItem( 'piedUsers' ).then( function( value ) {

		// Maybe get existing pied users.
		piedUsers = value ? value : piedUsers;

		// Enable ListJS on commenter list.
		var commenterList = new List( 'pf-commenter-content', {
			valueNames: [ 'pf-commenter' ],
		});

		// Enable ListJS on pied list.
		var piedList = new List( 'pf-pied-content', {
			valueNames: [ 'pf-commenter' ],
		});

		commenterList.remove( 'pf-commenter', '' );
		piedList.remove( 'pf-commenter', '' );

		// Remove existing pied users from commenter list.
		if ( piedUsers && piedUsers.length ) {
			// Loop through pied users.
			for ( var i = 0; i < piedUsers.length; i++ ) {
				commenterList.remove( 'pf-commenter', piedUsers[i] );
				piedList.add({ 'pf-commenter': piedUsers[i] });
				hideComments( piedUsers[i] );
			}
		} else {
			// Add no pied users class.
			$piedContent.addClass( 'pf-no-pied-commenters' );
		}

		// Add/Remove commenter.
		$( '.pf-list' ).on( 'click', '.pf-button', function(e) {

			// Get the commenter name.
			var commenter = $(this).children( '.pf-commenter' ).html();

			// Escape.
			commenter = getEscaped( commenter );

			// Bail if no value.
			if ( ! commenter.length ) {
				return;
			}

			// If adding.
			if ( $(this).hasClass( 'pf-add' ) ) {
				addUser( commenter );
			}
			// If removing.
			else if ( $(this).hasClass( 'pf-remove' ) ) {
				removeUser( commenter );
			}
		});

		function hideComments( commenter ) {
			var $comment = $( 'comment-author-name[data-name="' + commenter + '"]' ).closest( '.comment' );
			$comment.slideUp();
		}

		function addUser( commenter ) {
			// Add new user to our array.
			piedUsers.push( commenter );
			// Make the array unique.
			piedUsers = piedUsers.filter( makeUnique );
			// Save the new array in storage.
			localforage.setItem( 'piedUsers', piedUsers );
			// Remove from commenter list.
			commenterList.remove( 'pf-commenter', commenter );
			// Add to pied user list.
			piedList.add({ 'pf-commenter': commenter });
			// Check for for empty lists.
			checkEmpty();
		}

		function removeUser( commenter ) {
			// Get the index of the clicked item.
			var index = piedUsers.indexOf( commenter );
			// Bail if it's not a valid item.
			if ( -1 === index ) {
				return;
			}
			// Remove the item.
			piedUsers.splice( index, 1 );
			// Save the new array in storage.
			localforage.setItem( 'piedUsers', piedUsers );
			// Remove from the pied list.
			piedList.remove( 'pf-commenter', commenter );
			// Add to user back to commenter list.
			commenterList.add({ 'pf-commenter': commenter });
			// Check for for empty lists.
			checkEmpty();
		}

		function checkEmpty() {
			// If commenters in the list and has the no-commenters class.
			if ( commenterList.visibleItems.length && $commenterContent.hasClass( 'pf-no-commenters' ) ) {
				$commenterContent.removeClass( 'pf-no-commenters' );
			}
			// If no commenters left and doesn't have no-commenters class.
			else if ( ! ( commenterList.visibleItems.length && $commenterContent.hasClass( 'pf-no-commenters' ) ) ) {
				$commenterContent.addClass( 'pf-no-commenters' );
			}
			// If pied commenters left and has no-pied-commenters class.
			if ( piedList.visibleItems.length && $piedContent.hasClass( 'pf-no-pied-commenters' ) ) {
				$piedContent.removeClass( 'pf-no-pied-commenters' );
			}
			// If no pied commenters left and doesn't have no-pied-commenters class.
			else if ( ! ( piedList.visibleItems.length && $piedContent.hasClass( 'pf-no-pied-commenters' ) ) ) {
				$piedContent.addClass( 'pf-no-pied-commenters' );
			}
		}
	});

	function getEscaped( string ) {
		var div = document.createElement( 'div' );
		div.appendChild( document.createTextNode( string ) );
		return div.innerHTML;
	}

	/**
	 *
	 * Use:
	 * myArray.filter( makeUnique );
	 *
	 * If need some new ways, try this:
	 * @link  https://gomakethings.com/removing-duplicates-from-an-array-with-vanilla-javascript/
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
