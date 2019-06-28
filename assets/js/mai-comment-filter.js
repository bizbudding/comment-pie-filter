// Get it started.
jQuery( function($) {

	// Use with caution!!!
	// localforage.clear();

	// Bail if localforage is not available.
	if ( 'object' !== typeof localforage ) {
		return;
	}

	var displaySetting     = '';
	var filteredCommenters = [];
	var imageCount         = commentFilterVars.images.length;
	var quoteCount         = commentFilterVars.quotes.length;
	var imageIndex         = 0;
	var quoteIndex         = 0;
	var $commentsWrap      = $( '#comments' );
	var $respondWrap       = $( '#respond' );
	var $commenterList     = $( '#jetsCommenterList' );
	var $filteredList      = $( '#jetsFilteredList' );
	var $commenterContent  = $( '#cf-commenter-content' );
	var $filteredContent   = $( '#cf-filtered-content' );
	var $settingsForm      = $( '#cf-settings-form' );


	// Bail if no comment or reply elements.
	if ( ! ( $commentsWrap.length || $respondWrap.length ) ) {
		return;
	}

	// Manage display setting.
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

	// Update display setting on change.
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

	// Get filteredCommenters.
	localforage.getItem( 'filteredCommenters' ).then( function( value ) {

		// Maybe get existing filtered commenters.
		filteredCommenters = value ? value : filteredCommenters;

		var commenterList = new Jets({
			searchTag: '#jetsCommenterSearch',
			contentTag: '#jetsCommenterList',
		});

		var filteredList = new Jets({
			searchTag: '#jetsFilteredSearch',
			contentTag: '#jetsFilteredList',
		});

		// If we have filtered commenters already on initial page load.
		if ( filteredCommenters && filteredCommenters.length ) {
			// Loop through filtered commenters.
			for ( var i = 0; i < filteredCommenters.length; i++ ) {
				filterThisCommenter( filteredCommenters[i] );
			}
		}

		// Check for empty lists.
		doEmptyLists();

		// Filter/Unfilter commenter.
		$( '.cf-list' ).on( 'click', '.cf-list-item', function(e) {

			// Get the commenter name.
			var commenter = $(this).text();

			// Bail if no value.
			if ( ! commenter.length ) {
				return;
			}

			// If adding.
			if ( $(this).hasClass( 'cfAdd' ) ) {
				filterThisCommenter( commenter );
			}
			// If removing.
			else if ( $(this).hasClass( 'cfRemove' ) ) {
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
			filteredCommenters.push( commenter );
			// Make the array unique.
			filteredCommenters = filteredCommenters.filter( makeUnique );
			// Save the new array in storage.
			localforage.setItem( 'filteredCommenters', filteredCommenters );
			// Add them to the filtered list.
			$filteredList.append( '<li class="cf-list-item cf-commenter-item cfRemove" data-action="' + commentFilterVars.textRemove + '">' + commenter + '</li>' );
			// Remove existing filtered commenters from commenter list.
			$commenterList.find( 'li[data-jets="' + commenter.toLowerCase() + '"]' ).remove();
			// Update Jets.
			filteredList.update();
			commenterList.update();
			// Hide comments.
			hideComments( commenter );
			// Check for for empty lists.
			doEmptyLists();
		}

		function unfilterThisCommenter( commenter ) {
			// Get the index of the clicked item.
			var index = filteredCommenters.indexOf( commenter );
			// Bail if it's not a valid item.
			if ( -1 === index ) {
				return;
			}
			// Remove the item.
			filteredCommenters.splice( index, 1 );
			// Save the new array in storage.
			localforage.setItem( 'filteredCommenters', filteredCommenters );
			// Remove from the filtered list.
			$filteredList.find( 'li[data-jets="' + commenter.toLowerCase() + '"]' ).remove();
			// If commenter exists on the page.
			var $inner = $( '.cf-comment-inner[data-name="' + commenter + '"]' );
			if ( $inner.length ) {
				// Add to user back to commenter list.
				$commenterList.append( '<li class="cf-list-item cf-commenter-item cfAdd" data-action="' + commentFilterVars.textAdd + '">' + commenter + '</li>' );
			}
			// Update Jets.
			filteredList.update();
			commenterList.update();
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
			// Get the index of the clicked item.
			var index = filteredCommenters.indexOf( commenter );
			// Bail if commenter is also filtered.
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
			var commenterItems = $commenterList.find( 'li' ).length;
			var filteredItems  = $filteredList.find( 'li' ).length;
			// If commenters in the list and has the no-commenters class.
			if ( bool( commenterItems && $commenterContent.hasClass( 'cf-no-commenters' ) ) ) {
				$commenterContent.removeClass( 'cf-no-commenters' );
			}
			// If no commenters in the list and doesn't have no-commenters class.
			else if ( ! bool( commenterItems ) && ! bool( $commenterContent.hasClass( 'cf-no-commenters' ) ) ) {
				$commenterContent.addClass( 'cf-no-commenters' );
			}

			// If filtered commenters in the list and has no-filtered-commenters class.
			if ( bool( filteredItems && $filteredContent.hasClass( 'cf-no-commenters' ) ) ) {
				$filteredContent.removeClass( 'cf-no-commenters' );
			}
			// If no filtered commenters in the list and doesn't have no-filtered-commenters class.
			else if ( ! bool( filteredItems ) && ! bool( $filteredContent.hasClass( 'cf-no-commenters' ) ) ) {
				$filteredContent.addClass( 'cf-no-commenters' );
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
					$cfContent.html( '<p>' + commentFilterVars.quotes[ quoteIndex ] + '</p>' );
					quoteIndex++;
					break;
				default:
					$cfContent.html( '' );
			}
		});
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
