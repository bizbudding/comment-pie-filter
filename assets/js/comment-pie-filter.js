// Get it started.
jQuery( function($) {

	// Bail if localforage is not available.
	if ( 'object' !== typeof localforage ) {
		return;
	}

	var piedCommenters    = [];
	var $commenterContent = $( '#pf-commenter-content' );
	var $piedContent      = $( '#pf-pied-content' );
	var commentUpIcon     = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" x="0px" y="0px" height="2em" width="2em" fill="currentColor"><title>comment-up</title><g data-name="comment-up"><path d="M28,3H4A2,2,0,0,0,2,5V23a2,2,0,0,0,2,2H6v3a1,1,0,0,0,.57.9A.91.91,0,0,0,7,29a1,1,0,0,0,.62-.22L12.35,25H28a2,2,0,0,0,2-2V5A2,2,0,0,0,28,3Zm0,20H12a1,1,0,0,0-.62.22L8,25.92V24a1,1,0,0,0-1-1H4V5H28Z"/><path d="M12.71,14.71,15,12.41V18a1,1,0,0,0,2,0V12.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4a1,1,0,0,0,1.42,1.42Z"/></g></svg>';
	var commentDownIcon   = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" x="0px" y="0px" height="2em" width="2em" fill="currentColor"><title>comment-down</title><g data-name="comment-down"><path d="M28,3H4A2,2,0,0,0,2,5V23a2,2,0,0,0,2,2H6v3a1,1,0,0,0,.57.9A.91.91,0,0,0,7,29a1,1,0,0,0,.62-.22L12.35,25H28a2,2,0,0,0,2-2V5A2,2,0,0,0,28,3Zm0,20H12a1,1,0,0,0-.62.22L8,25.92V24a1,1,0,0,0-1-1H4V5H28Z"/><path d="M15.29,18.71a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l4-4a1,1,0,0,0-1.42-1.42L17,15.59V10a1,1,0,0,0-2,0v5.59l-2.29-2.3a1,1,0,0,0-1.42,1.42Z"/></g></svg>';

	// Loop through piedCommenters.
	localforage.getItem( 'piedCommenters' ).then( function( value ) {

		// Maybe get existing pied users.
		piedCommenters = value ? value : piedCommenters;

		// Enable ListJS on commenter list.
		var commenterList = new List( 'pf-commenter-content', {
			valueNames: [ 'pf-commenter' ],
		});

		// Enable ListJS on pied list.
		var piedList = new List( 'pf-pied-content', {
			valueNames: [ 'pf-commenter' ],
		});

		// Remove our first default row. It's only there so ListJS can have access to clone it via add().
		commenterList.remove( 'pf-commenter', '' );
		piedList.remove( 'pf-commenter', '' );

		// If we have pied commenters already on initial page load.
		if ( piedCommenters && piedCommenters.length ) {
			// Loop through pied users.
			for ( var i = 0; i < piedCommenters.length; i++ ) {
				// Remove existing pied users from commenter list.
				commenterList.remove( 'pf-commenter', piedCommenters[i] );
				piedList.add({ 'pf-commenter': piedCommenters[i] });
				hideComments( piedCommenters[i] );
			}
		}

		// Check for empty lists.
		doEmptyLists();

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
				pieThisCommenter( commenter );
			}
			// If removing.
			else if ( $(this).hasClass( 'pf-remove' ) ) {
				unpieThisCommenter( commenter );
			}
		});

		// Toggle the comment content.
		// $( '.comment' ).on( 'click', '.pf-comment-toggle', function(e) {
		// 	var $content = $(this).parents( '.comment-reply' ).prev( '.comment-content' );
		// 	if ( ! $content.length ) {
		// 		return;
		// 	}
		// 	$content.slideToggle().toggleClass( 'pf-comment-open' );
		// 	if ( $content.hasClass( 'pf-comment-open' ) ) {
		// 		$(this).html( commentUpIcon );
		// 	} else {
		// 		$(this).html( commentDownIcon );
		// 	}
		// });

		$( '.comment' ).on( 'click', '.pf-comment-toggle', function(e) {
			var $commentLi = $(this).closest( '.comment' );
			if ( ! $commentLi.length ) {
				return;
			}
			$commentLi.toggleClass( 'pf-hidden-visible' );
			// if ( $commentLi.hasClass( 'pf-hidden-visible' ) ) {
				// $(this).html( commentUpIcon );
			// } else {
				// $(this).html( commentDownIcon );
			// }
		});

		function pieThisCommenter( commenter ) {
			// Add new user to our array.
			piedCommenters.push( commenter );
			// Make the array unique.
			piedCommenters = piedCommenters.filter( makeUnique );
			// Save the new array in storage.
			localforage.setItem( 'piedCommenters', piedCommenters );
			// Add to pied user list.
			piedList.add({ 'pf-commenter': commenter });
			// Remove from commenter list.
			commenterList.remove( 'pf-commenter', commenter );
			// Hide comments.
			hideComments( commenter );
			// Check for for empty lists.
			doEmptyLists();
		}

		function unpieThisCommenter( commenter ) {
			// Get the index of the clicked item.
			var index = piedCommenters.indexOf( commenter );
			// Bail if it's not a valid item.
			if ( -1 === index ) {
				return;
			}
			// Remove the item.
			piedCommenters.splice( index, 1 );
			// Save the new array in storage.
			localforage.setItem( 'piedCommenters', piedCommenters );
			// Remove from the pied list.
			piedList.remove( 'pf-commenter', commenter );
			// If commenter exists on the page.
			var $inner = $( '.pf-comment-inner[data-name="' + commenter + '"]' );
			if ( $inner.length ) {
				// Add to user back to commenter list.
				commenterList.add({ 'pf-commenter': commenter });
			}
			// Show comments.
			showComments( commenter );
			// Check for for empty lists.
			doEmptyLists();
		}

		function hideComments( commenter ) {
			var $comment = getComment( commenter );
			if ( ! $comment.length ) {
				return;
			}
			hideComment( $comment );
			hideReplies( $comment );
		}

		function hideReplies( $comment ) {
			$replies = getReplies( $comment );
			if ( ! $replies.length ) {
				return;
			}
			hideComment( $replies );
		}

		function hideComment( $comment ) {
			$comment.parents( '.comment' ).addClass( 'pf-hidden' );
			// TODO: Get setting here and find overlay content.
			$comment.after( '<button class="button alt small pf-comment-toggle">Toggle Comment</button>' ).after( '<span class="pf-overlay"></span>' );
		}

		function showComments( commenter ) {
			var $comment = getComment( commenter );
			if ( ! $comment.length ) {
				return;
			}
			showComment( $comment );
			showReplies( $comment, commenter );
		}

		function showReplies( $comment ) {
			$replies = getReplies( $comment );
			if ( ! $replies.length ) {
				return;
			}
			// Get the commenter name.
			var commenter = $replies.data( 'name' );
			// Escape.
			commenter = getEscaped( commenter );
			// Get the index of the clicked item.
			var index = piedCommenters.indexOf( commenter );
			// Bail if commenter is also pied.
			if ( -1 !== index ) {
				return;
			}
			showComment( $replies );
		}

		function showComment( $comment ) {
			var $commentLi = $comment.parent( '.comment' );
			var $overlay   = $commentLi.find( '.pf-overlay' );
			var $toggle    = $commentLi.find( '.pf-comment-toggle' );
			if ( $commentLi.length ) {
				$commentLi.removeClass( 'pf-hidden pf-hidden-visible' );
			}
			if ( $overlay.length ) {
				$overlay.remove();
			}
			if ( $toggle.length ) {
				$toggle.remove();
			}
		}

		function getComment( commenter ) {
			var $comment = $( '.pf-comment-inner[data-name="' + commenter + '"]' );
			if ( ! $comment.length ) {
				return {};
			}
			return $comment;
		}

		function getCommentContent( $comment ) {
			var $content = $comment.find( '.comment-content' );
			if ( ! $content.length ) {
				return {};
			}
			return $content;
		}

		function getReplies( $comment ) {
			var id = $comment.data( 'id' );
			if ( ! id ) {
				return {};
			}
			$replies = $( '.pf-comment-inner[data-parent="' + id + '"]' );
			if ( ! $replies.length ) {
				return {};
			}
			return $replies;
		}

		function doEmptyLists() {
			// If commenters in the list and has the no-commenters class.
			if ( bool( commenterList.visibleItems.length && $commenterContent.hasClass( 'pf-no-commenters' ) ) ) {
				$commenterContent.removeClass( 'pf-no-commenters' );
			}
			// If no commenters in the list and doesn't have no-commenters class.
			else if ( ! bool( commenterList.visibleItems.length ) && ! bool( $commenterContent.hasClass( 'pf-no-commenters' ) ) ) {
				$commenterContent.addClass( 'pf-no-commenters' );
			}

			// If pied commenters in the list and has no-pied-commenters class.
			if ( bool( piedList.visibleItems.length && $piedContent.hasClass( 'pf-no-commenters' ) ) ) {
				$piedContent.removeClass( 'pf-no-commenters' );
			}
			// If no pied commenters in the list and doesn't have no-pied-commenters class.
			else if ( ! bool( piedList.visibleItems.length ) && ! bool( $piedContent.hasClass( 'pf-no-commenters' ) ) ) {
				$piedContent.addClass( 'pf-no-commenters' );
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

	/**
	 * Convert a value to bool.
	 *
	 * @return  bool.
	 */
	function bool( v ) {
		return v === 'false' || v === 'null' || v === 'NaN' || v === 'undefined' || v === '0' ? false : !! v;
	}

});
