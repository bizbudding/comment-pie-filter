// Get it started.
jQuery( function($) {

	// localforage.clear();

	// var piedUsers  = [],
	var $emailForm = $( '.pf-name-form' );
	var $piedList  = $( '.pf-list' );
	var trashCan   = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" fill="currentColor" height="2em" width="2em" x="0px" y="0px" viewBox="0 0 100 125" style="enable-background:new 0 0 100 100;" xml:space="preserve"><g><path d="M76,26H61v-7H39v7H24v9h4.33307l3.99994,46h35.33398l3.99994-46H76V26z M41,21h18v5H41V21z M65.83301,79H34.16699   l-3.82617-44h39.31836L65.83301,79z M74,33h-2.15918H28.15918H26v-5h13h22h13V33z"/><rect x="49" y="39.94043" width="2" height="34.05957"/><polygon points="61.49805,39.94043 59.50195,39.94043 57.50195,74 59.49805,74  "/><polygon points="42.49805,74 40.49805,39.94043 38.50195,39.94043 40.50195,74  "/></g></svg>';

	localforage.getItem( 'piedUsers' ).then( function( value ) {

		var piedUsers  = value ? value : [];
		var commenters = [];

		// Get the commenter names as an array.
		var commenterNames = $( '.comment-author-name' ).map( function() {
			return $(this).data( 'name' );
		}).get();

		// Remove already piedUsers from the array of choices.
		commenterNames = commenterNames.filter( function( el ) {
			return piedUsers.indexOf( el ) < 0;
		});

		// Remove duplicates.
		commenterNames = commenterNames.filter( makeUnique );

		// Add commenters object to array of commenters.
		$.each( commenterNames, function( index, value ) {
			commenters.push({
				value: value,
				label: value,
			});
		});

		// Setup choices select field.
		var pieChoices = new Choices( $( '[name="pf-name"]' )[0], {
			choices: commenters,
			searchPlaceholderValue: 'Enter commenter name...',
			maxItemCount: 1,
			removeItems: true,
		});

		console.log( piedUsers );

		displayPiedUsers();
		hidePiedUsers();

		// Form submitted.
		$emailForm.on( 'submit', function(e) {

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

			// Clear the input.
			pieChoices.clearInput();

			// Show the list.
			displayPiedUsers();
		});

		// Remove item if clicking a remove button.
		$piedList.on( 'click', '.pf-remove', function(e) {
			// Get the index of the clicked item.
			var index = piedUsers.indexOf( $(this).data( 'value' ) );
			// If it's a valid item.
			if ( index !== -1 ) {
				// Remove the item.
				piedUsers.splice( index, 1 );
				// Save the new array in storage.
				localforage.setItem( 'piedUsers', piedUsers );
				// Hide the item.
				$(this).parent( 'li' ).fadeOut();
			}
		});

	});

	function displayPiedUsers() {
		localforage.getItem( 'piedUsers' ).then( function( value ) {
			if ( value && value.length ) {
				$piedList.fadeOut().html( '' );
				for ( var i = 0; i < value.length; i++ ) {
					$piedList.append( '<li><button class="pf-remove" data-value="' + value[i] + '">' + value[i] + '&nbsp;' + trashCan + '</button></li>' );
				}
				$piedList.fadeIn();
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
