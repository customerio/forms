(function ( $, undefined ) { "use strict";

  // Caching jQuery elements
  // This step isn't necessary, but it is highly recommended
  var $myForm = $('#my-form');
  var $formSuccess = $('#form-success');

  // Basic Implementation
  // The single line of code below is all you need to get your form working!
  // $myForm.cioForm();

  // Implementation + Customization
  // In addition to sending the data to Customer.io, we're going to prevent
  // the page from reloading and show success message. We're also going
  // to pass the "Name" that the user entered into our success message..
  // To add a personal touch ;)

  $myForm.cioForm({
    remote: true,
    success: function( data ) {
      // This hides the form
      this.$el.hide();

      // Find the selector to add the user's name into
      $formSuccess.find( ".user-name" )
        // Add in the user's name from our data object
        .text( data.name );

      // Show the success message!
      $formSuccess.show();

    }
  });

})(jQuery);