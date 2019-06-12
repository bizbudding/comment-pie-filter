// Get it started.
jQuery( function($) {

	// localforage.clear();

	var piedUsers     = [];
	var commenters    = [];
	var choicesObject       = {};
	var $emailForm    = $( '.pf-name-form' );
	var $submitButton = $( '.pf-name-submit' );
	var $piedList     = $( '.pf-list' );
	var trashCan      = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" fill="currentColor" height="2em" width="2em" x="0px" y="0px" viewBox="0 0 100 125" style="enable-background:new 0 0 100 100;" xml:space="preserve"><g><path d="M76,26H61v-7H39v7H24v9h4.33307l3.99994,46h35.33398l3.99994-46H76V26z M41,21h18v5H41V21z M65.83301,79H34.16699   l-3.82617-44h39.31836L65.83301,79z M74,33h-2.15918H28.15918H26v-5h13h22h13V33z"/><rect x="49" y="39.94043" width="2" height="34.05957"/><polygon points="61.49805,39.94043 59.50195,39.94043 57.50195,74 59.49805,74  "/><polygon points="42.49805,74 40.49805,39.94043 38.50195,39.94043 40.50195,74  "/></g></svg>';

	localforage.getItem( 'piedUsers' ).then( function( value ) {

		piedUsers = value ? value : piedUsers;

		// var commenters = [{
		// 	value: '',
		// 	label: ' Select commenter...',
		// }];

		var $selectField = $( '[name="pf-name"]' )[0];
		var placeholder  = 'Enter commenter name...',

		// Setup choices select field.
		choicesObject = new Choices( $selectField, {
			// choices: commenters,
			searchPlaceholderValue: placeholder,
			maxItemCount: 1,
			noChoicesText: 'This post does not have any comments yet.',
			// removeItems: true,
			// removeItemButton: true,
		});

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

		// Set actual choices from comments choices.
		choicesObject.setChoices( commenters, 'value', 'label', true );

		// setCommenterChoices();
		displayPiedUsers();
		hidePiedUsers();

		// Enable/disable submit button based on selected item.
		choicesObject.passedElement.element.addEventListener( 'change', function(event) {
			if ( '' !== event.detail.value ) {
				$submitButton.prop( 'disabled', false );
			} else {
				$submitButton.prop( 'disabled', true );
			}
		}, false );

		// Form submitted.
		$emailForm.on( 'submit', function(e) {

			e.preventDefault();

			// Clear the input.
			choicesObject.removeActiveItems();

			// Get the submitted value.
			var submitted = choicesObject.getValue( true );

			// Bail if no submitted name.
			if ( ! submitted ) {
				return;
			}

			// Empty the select field.
			choicesObject.removeActiveItems();

			// choicesObject.setValue( null );
			// choicesObject.clearInput();
			// choicesObject.clearChoices();
			// choicesObject.removeHighlightedItems();
			// choicesObject.removeActiveItemsByValue( name );
			// choicesObject.setChoiceByValue( '' );

			// Add new user to our array.
			piedUsers.push( submitted );

			// Make the array unique.
			piedUsers = piedUsers.filter( makeUnique );

			// Save the new array in storage.
			localforage.setItem( 'piedUsers', piedUsers );

			// Disable the option.
			var $thisOption = $selectField.find( 'option[value="' + submitted + '"]' );

			console.log( $thisOption );

			$thisOption.prop( 'disabled', true );

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

	function setCommenterChoices() {


	}

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
