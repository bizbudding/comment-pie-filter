// Get it started.
jQuery( function($) {

	// Use with caution!!!
	// localforage.clear();

	// Bail if localforage is not available.
	if ( 'object' !== typeof localforage ) {
		return;
	}

	// Bail if no comments.
	var $commentsWrap = $( '#comments' );
	if ( ! $commentsWrap.length ) {
		return;
	}

	var displaySetting    = '';
	var piedCommenters    = [];
	var imageCount        = commentFilterVars.images.length;
	var quoteCount        = commentFilterVars.quotes.length;
	var imageIndex        = 0;
	var quoteIndex        = 0;
	var $commenterContent = $( '#cf-commenter-content' );
	var $piedContent      = $( '#cf-pied-content' );
	var $settingsForm     = $( '#cf-settings-form' );
	var commentUpIcon     = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" x="0px" y="0px" height="2em" width="2em" fill="currentColor"><title>comment-up</title><g data-name="comment-up"><path d="M28,3H4A2,2,0,0,0,2,5V23a2,2,0,0,0,2,2H6v3a1,1,0,0,0,.57.9A.91.91,0,0,0,7,29a1,1,0,0,0,.62-.22L12.35,25H28a2,2,0,0,0,2-2V5A2,2,0,0,0,28,3Zm0,20H12a1,1,0,0,0-.62.22L8,25.92V24a1,1,0,0,0-1-1H4V5H28Z"/><path d="M12.71,14.71,15,12.41V18a1,1,0,0,0,2,0V12.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4a1,1,0,0,0,1.42,1.42Z"/></g></svg>';
	var commentDownIcon   = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" x="0px" y="0px" height="2em" width="2em" fill="currentColor"><title>comment-down</title><g data-name="comment-down"><path d="M28,3H4A2,2,0,0,0,2,5V23a2,2,0,0,0,2,2H6v3a1,1,0,0,0,.57.9A.91.91,0,0,0,7,29a1,1,0,0,0,.62-.22L12.35,25H28a2,2,0,0,0,2-2V5A2,2,0,0,0,28,3Zm0,20H12a1,1,0,0,0-.62.22L8,25.92V24a1,1,0,0,0-1-1H4V5H28Z"/><path d="M15.29,18.71a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l4-4a1,1,0,0,0-1.42-1.42L17,15.59V10a1,1,0,0,0-2,0v5.59l-2.29-2.3a1,1,0,0,0-1.42,1.42Z"/></g></svg>';

	localforage.getItem( 'commentFilterDisplay' ).then( function( value ) {
		if ( ! value ) {
			displaySetting = $settingsForm.find( 'input[name="cf-display"]:checked' ).val();
			// Save setting in local storage.
			localforage.setItem( 'commentFilterDisplay', displaySetting );
		} else {
			displaySetting = value;
			$settingsForm.find( 'input[name="cf-display"][value="' + displaySetting + '"]' ).prop( 'checked', true );
		}
	});

	// Update setting on change.
	$settingsForm.on( 'change', '[name="cf-display"]', function(e) {
		// Save setting variable.
		displaySetting = this.value;
		// Save setting in local storage.
		localforage.setItem( 'commentFilterDisplay', displaySetting );
		// Update content.
		var $cfContent = $( '.cf-content' );
		// Bail if no overlays.
		if ( ! $cfContent.length ) {
			return;
		}
		// Add the filtered content.
		$.each( $cfContent, function( index, value ) {
			doCommentContent( $(this) );
		});
	});

	// Loop through piedCommenters.
	localforage.getItem( 'piedCommenters' ).then( function( value ) {

		// Maybe get existing pied users.
		piedCommenters = value ? value : piedCommenters;

		// Enable ListJS on commenter list.
		var commenterList = new List( 'cf-commenter-content', {
			valueNames: [ 'cf-commenter' ],
		});

		// Enable ListJS on pied list.
		var piedList = new List( 'cf-pied-content', {
			valueNames: [ 'cf-commenter' ],
		});

		// Remove our first default row. It's only there so ListJS can have access to clone it via add().
		commenterList.remove( 'cf-commenter', '' );
		piedList.remove( 'cf-commenter', '' );

		// If we have pied commenters already on initial page load.
		if ( piedCommenters && piedCommenters.length ) {
			// Loop through pied users.
			for ( var i = 0; i < piedCommenters.length; i++ ) {
				// Remove existing pied users from commenter list.
				commenterList.remove( 'cf-commenter', piedCommenters[i] );
				piedList.add({ 'cf-commenter': piedCommenters[i] });
				hideComments( piedCommenters[i] );
			}
		}

		// Check for empty lists.
		doEmptyLists();

		// Filter/Unfilter commenter.
		$( '.cf-list' ).on( 'click', '.cf-button', function(e) {

			// Get the commenter name.
			var commenter = $(this).children( '.cf-commenter' ).html();

			// Escape.
			commenter = getEscaped( commenter );

			// Bail if no value.
			if ( ! commenter.length ) {
				return;
			}

			// If adding.
			if ( $(this).hasClass( 'cf-add' ) ) {
				filterThisCommenter( commenter );
			}
			// If removing.
			else if ( $(this).hasClass( 'cf-remove' ) ) {
				unfilterThisCommenter( commenter );
			}
		});

		// Toggle the comment content.
		$( '.comment' ).on( 'click', '.cf-toggle', function(e) {
			var $commentLi = $(this).closest( '.comment' );
			if ( ! $commentLi.length ) {
				return;
			}
			$commentLi.toggleClass( 'cf-hidden-visible' );
		});

		function filterThisCommenter( commenter ) {
			// Add new user to our array.
			piedCommenters.push( commenter );
			// Make the array unique.
			piedCommenters = piedCommenters.filter( makeUnique );
			// Save the new array in storage.
			localforage.setItem( 'piedCommenters', piedCommenters );
			// Add to pied user list.
			piedList.add({ 'cf-commenter': commenter });
			// Remove from commenter list.
			commenterList.remove( 'cf-commenter', commenter );
			// Hide comments.
			hideComments( commenter );
			// Check for for empty lists.
			doEmptyLists();
		}

		function unfilterThisCommenter( commenter ) {
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
			piedList.remove( 'cf-commenter', commenter );
			// If commenter exists on the page.
			var $inner = $( '.cf-comment-inner[data-name="' + commenter + '"]' );
			if ( $inner.length ) {
				// Add to user back to commenter list.
				commenterList.add({ 'cf-commenter': commenter });
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

			// Loop through em. I was getting duplicates when the same user commented back to back.
			$.each( $comment, function( index, value ) {

				// Get the main wrap.
				var $commentLi = $(this).parents( '.comment' );

				// Bail if already hidden (this may be cause it's a reply to filtered comment).
				if ( $(this).hasClass( 'cf-hidden' ) ) {
					return;
				}

				// Add hidden class.
				$(this).parents( '.comment' ).addClass( 'cf-hidden' );

				// Maybe add toggle.
				var $toggle = $(this).find( '.cf-toggle' );
				if ( ! $toggle.length ) {
					$toggle = $( '<button role="button" class="comment-reply-link cf-toggle">Toggle</button>' );
					$(this).find( '.comment-reply' ).append( $toggle );
				}

				// Maybe add new content.
				var $cfContent = $(this).find( '.cf-content' );
				if ( ! $cfContent.length ) {
					$cfContent = $( '<div class="comment-content cf-content"></div>' );
					$(this).find( '.comment-content' ).after( $cfContent );
				}

				// Bail if no new content.
				if ( ! $cfContent.length ) {
					return;
				}

				doCommentContent( $cfContent );
			});
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
			var $cfContent = $commentLi.find( '.cf-content' );
			var $toggle    = $commentLi.find( '.cf-toggle' );
			if ( $commentLi.length ) {
				$commentLi.removeClass( 'cf-hidden cf-hidden-visible' );
			}
			if ( $cfContent.length ) {
				$cfContent.remove();
			}
			if ( $toggle.length ) {
				$toggle.remove();
			}
		}

		function getComment( commenter ) {
			var $comment = $( '.cf-comment-inner[data-name="' + commenter + '"]' );
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
			$replies = $( '.cf-comment-inner[data-parent="' + id + '"]' );
			if ( ! $replies.length ) {
				return {};
			}
			return $replies;
		}

		function doEmptyLists() {
			// If commenters in the list and has the no-commenters class.
			if ( bool( commenterList.visibleItems.length && $commenterContent.hasClass( 'cf-no-commenters' ) ) ) {
				$commenterContent.removeClass( 'cf-no-commenters' );
			}
			// If no commenters in the list and doesn't have no-commenters class.
			else if ( ! bool( commenterList.visibleItems.length ) && ! bool( $commenterContent.hasClass( 'cf-no-commenters' ) ) ) {
				$commenterContent.addClass( 'cf-no-commenters' );
			}

			// If pied commenters in the list and has no-pied-commenters class.
			if ( bool( piedList.visibleItems.length && $piedContent.hasClass( 'cf-no-commenters' ) ) ) {
				$piedContent.removeClass( 'cf-no-commenters' );
			}
			// If no pied commenters in the list and doesn't have no-pied-commenters class.
			else if ( ! bool( piedList.visibleItems.length ) && ! bool( $piedContent.hasClass( 'cf-no-commenters' ) ) ) {
				$piedContent.addClass( 'cf-no-commenters' );
			}
		}
	});

	function doCommentContent( $cfContent ) {
		$.each( $cfContent, function( index, value ) {
			switch( displaySetting ) {
				case 'image':
					// var content = commentFilterVars.images[ Math.floor( Math.random() * commentFilterVars.images.length ) ];
					if ( imageIndex === imageCount ) {
						imageIndex = 0;
					}
					$cfContent.html( '<p>' + commentFilterVars.images[ imageIndex ] + '</p>' );
					imageIndex++;
					break;
				case 'quote':
					// var content = commentFilterVars.quotes[ Math.floor( Math.random() * commentFilterVars.quotes.length ) ];
					if ( quoteIndex === quoteCount ) {
						quoteIndex = 0;
					}
					console.log( quoteIndex );
					$cfContent.html( '<p>' + commentFilterVars.quotes[ quoteIndex ] + '</p>' );
					quoteIndex++;
					break;
				default:
					$cfContent.html( '' );
			}
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
