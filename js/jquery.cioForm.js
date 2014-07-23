/*!
 * Customer.io - Form
 * A jQuery plugin that hooks into HTML forms to send data to Customer.io
 * Copyright 2014 Customer.io
 * Licensed under MIT
 *
 * Plugin Methods
 *
 * $("#form").cioForm({
 *   before: function() {
 *     // This method executes before the data is sent
 *   },
 *   completed: function() {
 *     // This method executes if the user has already filled out the form
 *   },
 *   error: function() {
 *     // This method executes if there's an error
 *   },
 *   onLoad: function() {
 *     // This method executes when the form is rendered
 *   },
 *   success: function( data ) {
 *     // This method executes when the submission is successful
 *     // This method takes 1 argument. This argument is the object
 *     that was sent to Customer.io
 *   }
 * });
 *
 * "this" can be used to target the model that $.cioForm()
 * was triggered on.
 *
 * For example.. in the code below, this.$el in the before method
 * would target $("#form");
 *
 * before: function() {
 *   $this.el.show();
 * }
 *
 */

(function ( $, undefined ) { "use strict";

  // Return false if jQuery is not defined or valid
  if(!$ || typeof jQuery !== "function") {
      return false;
  }

  // Throw error if Customer.io is not setup properly
  // if( !window._cio || !window._cio.identify ) {
  //   throw "You don't have have Customer.io setup properly.";
  // }

  // Defining the plugin
  $.fn.cioForm = function( options ) {

    // Defining defaults
    var self = this;
    var $window = $(window);
    var _document = document;

    /**
     * _settings
     * These are private/internal settings and variables that cioForm uses
     *
     * @private
     */
    var _settings = {
        dataName: 'cioForm',
        success: false
    };

    /**
     * _settings
     * These are private/internal settings and variables that cioForm uses
     *
     * @private
     */
    var settings = $.extend( {
      action: "",
      remote: false,
      created_at: true
    }, options );

    // Privatized cookie object to be merged into settings object when ready
    var _settingsCookie = {
      name: "_cioForm",
      expire: 365,
      value: true
    };

    if( options && options.cookie ) {
      _settingsCookie = $.extend( _settingsCookie, options.cookie );
    }

    // Merging/setting the settings.cookie
    settings.cookie = _settingsCookie;

    /**
     * _callback
     * This is a private method that verifies and executes callbacks
     *
     * @param  { function } fn   [ The callback function ]
     * @param  { object }   el   [ A DOM element ]
     * @return { boolean }       [ True/False status of execution ]
     */
    var _callback = function( fn, el ) {
      // If fn is valid
      if( fn && typeof fn === "function" ) {
        // If el is valid
        if( el && typeof el === "object" ) {
          // Execute the function calling the el as this
          fn.call( el );
        } else {
          // Execute the function
          fn();
        }
        // Return true
        return true;
      } else {
        // Return false
        return false;
      }
    };

    /**
     * _ready
     * This is a private method that verifies that _cio is loaded into the DOM
     *
     * @param  { function } fn   [ The callback function ]
     * @return { function }      [ The callback method]
     */
    var _ready = function( fn ) {
      // if _cio is not available in window
      if( !window._cio ) {
        // Check again via recurssive _ready every 10ms, passing fn as parameter
        return setTimeout( _ready, 10, fn );
      }

      if( !window._cio.images || !window._cio.images[0] ) {
        // Check again via recurssive _ready every 10ms, passing fn as parameter
        return setTimeout( _ready, 10, fn );
      }

      // window._cio is loaded!
      // Return the callback if defined
      if( fn && typeof fn === "function" ) {
        return fn();
      }

    };



    /**
     * _identified
     * This is a private method that ensures that _cio.images is loaded correctly
     *
     * @param  { function } fn   [ The callback function ]
     * @return { function }      [ The callback method ]
     */
    var _identified = function( fn ) {

      // Execute when _cio is ready
      _ready( function() {

        var _images = window._cio.images;
        // If the last image in _cio.images is NOT "complete"
        if( _images[ _images.length - 1 ].complete !== true ) {
          // Check identified again
          return setTimeout( _identified, 10, fn );
        }

        // Return the callback if defined
        if( fn && typeof fn === "function" ) {
          return fn();
        }

      });

    };


    /**
     * Form
     * This is the constructor for the Form model
     *
     * @constructor
     * @param  { dom element } el   [ The cioForm dom element ]
     * @return { model }            [ Returns itself ]
     */
    var Form = function( el ) {
      // Return false if el is invalid
      if(!el || typeof el !== 'object') {
          return false;
      }

      // Defining the model's elements
      this.el = el;
      this.$el = $(el);

      // Defining the model's attributes (for CIO)
      this.attributes = {};

      // Initialize the model
      this.initialize();

      // Returning the model
      return this;

    };

    /**
     * get
     * This method retrieves a value from the model's attributes
     * @param  { value } key [ the name of the key to get from ]
     * @return { value }     [ the value of the key ]
     */
    Form.prototype.get = function( key ) {
      // Return false if the key is not defined
      if( key === undefined ) {
        return false;
      }
      // Return the key's value from attributes
      return this.attributes[ key ];
    };

    /**
     * getAction
     * This method (re)defines the form's action to prevent the form from
     * executing/sending before the data is sent to Customer.io
     */
    Form.prototype.getAction = function() {
      var el = this.el;
      // If the form has an attribute of action
      if( el.hasAttribute( "action" ) ) {
        // Get the action from the form
        settings.action = el.getAttribute( "action" );
        // Remove the form action
        el.removeAttribute( "action" );
      }
      // Return the model
      return this;
    };

    /**
     * getAttributes
     * This method gets the key + values from the from to generate an object
     * to be sent to Customer.io
     * @return { object } [ the cioForm object ]
     */
    Form.prototype.getAttributes = function() {
      // Defining self
      var that = this;
      // Defining $el
      var $el = this.$el;

      // Loop through all the inputs
      $el.find( "input" ).each( function() {
        // Defining the name and the value from the input field
        var name = this.name;
        var value = this.value;

        // Adjust the value if the input is a checkbox
        if( this.type === "checkbox" ) {
          value = this.checked.toString();
        }

        // If name and value are defined
        if( name && value ) {
          // Add the name and value to the attributes object
          that.attributes[ name ] = value;
        }

      });

      // Setting the ID
      that.setId();

      // Setting the "created_at" timestamp
      that.setTimestamp();

      // Return the model
      return this;
    };

    /**
     * getCookie
     * This method gets the Form cookie from the document
     * @param  { string } name [ name of the cookie ]
     */
    Form.prototype.getCookie = function( name ) {
      // Setting the name argument
      name = name ? name : settings.cookie.name;
      var nameEQ = name + "=";
      // Defining cookies from documents
      var cookies = document.cookie.split( ";" );
      // Looping through all the cookies
      for( var i = 0, len = cookies.length; i < len; i++ ) {
        // Defining a singular cookie
        var cookie = cookies[i];

        // Removing blanks
        while (cookie.charAt(0) === " " ) {
          cookie = cookie.substring( 1, cookie.length );
        }

        // If the cookie name matches
        if( cookie.indexOf( nameEQ ) === 0 ) {
          // Return the cookie value
          return cookie.substring( nameEQ.length, cookie.length );
        }
      }
      return;
    };

    /**
     * hasFilled
     * This method checks to see if the form has already been filled. It does this by checking to see if the cookie name is present in document.cookie.
     * @return { Boolean } [ true/false if the cookie has been set ]
     */
    Form.prototype.hasFilled = function() {
      // Return boolean if the cookie name exists in document.cookie
      return ( _document.cookie.indexOf( settings.cookie.name ) >= 0 );
    };


    /**
     * removeCookie
     * This method removes the cookie from the document
     *
     * @param  { string } name  [ the name of the cookie ]
     * @return { boolean }      [ status ]
     */
    Form.prototype.removeCookie = function( name ) {
      // Defining the cookie name to removed
      // If the name argument is not available, use the settings.cookie.name
      name = name ? name : settings.cookie.name;

      // Return false name is not a string
      if( !name || typeof name !== "string" ) {
        return false;
      }

      // Create a new (expiry) date
      var date = new Date();
      // Set the expiry date to a time in the past
      date.setDate( date.getDate() - 100 );
      // Removing the cookie by setting it into document.cookie
      _document.cookie = settings.cookie.name + "=; expires=" + date.toUTCString() + ";path=/";

      // Return true if successful
      return true;
    };

    /**
     * set
     * This method sets a key + value to the model's attributes to be sent
     * to Customer.io
     * @param { value } key   [ the name of the key from attributes ]
     * @param { value } value [ the value to set into the key ]
     * @return { value }      [ the value that was set]
     */
    Form.prototype.set = function( key, value ) {
      // Return false if the key is not defined
      if( key === undefined ) {
        return false;
      }
      // Set the key in attributes
      this.attributes[ key ] = value;
      // Return the key from attributes
      return this.attributes[ key ];
    };

    /**
     * setAction
     * This method sets the action attribute for the form during the submit
     * process
     *
     * @param   { string } [ an form action ]
     * @return  { object } [ the cioForm object ]
     */
    Form.prototype.setAction = function( action ) {
      var el = this.el;
      // If action argument is defined, use action argument. Fallback to action
      // defined in the settings
      action = action ? action : settings.action;
      el.setAttribute( "action", action );
      return this;
    };

    /**
     * setCookie
     * This method sets the Form cookie into the document
     * @param  { string } name      [ the name of the cookie ]
     * @param  { boolean } value    [ the value of the cookie ]
     * @param  { number } expire    [ number of days to set for expiry date ]
     * @return  { string } [ the cookie string ]
     */
    Form.prototype.setCookie = function( name, value, expire ) {
      // Defining a cookie variable (string)
      var cookie = "";

      // Defining the cookie's attributes
      name = name ? name : settings.cookie.name;
      value = value ? value : settings.cookie.value;
      expire = expire ? expire : settings.cookie.expire;

      // Return false if the name is not valid
      if( !name || typeof name !== "string" ) {
        return false;
      }

      // Creating a expiry date object
      var expireDate = new Date();
      // Set the expiration date based on settings
      expireDate.setDate( expireDate.getDate() + expire );
      // Set the expireDate into the settings cookie object
      expire = expireDate.toUTCString();

      // Create + set the cookie
      cookie = name + "=" + escape( value ) + ";expires=" + expire + ";path=/";

      // Setting the cookie into the document
      _document.cookie = cookie;

      // Returning status
      return true;
    };

    /**
     * setId
     * This method sets the ID attribute for the attribute object
     * that is to be sent to Customer.io
     * @param { string / number }   id [ The ID of the user ]
     * @return { string / number }  [ The ID of the user]
     */
    Form.prototype.setId = function( id ) {
      // Defining the variable for new ID
      var newId;
      // Getting the emails address from attributes
      var email = this.get( "email" );
      // If email is defined
      if( email ) {
        // Generate the new ID from the email
        newId = email.replace("@", "_");
        newId = newId.replace(".", "_");
      }
      // If the ID argument is defined, use that instead of newID
      id = id ? id : newId;
      // Setting the ID into attributes
      this.set( "id", id );
      // Returning the ID
      return id;
    };

    /**
     * setTimestamp
     * This method creates and sets the "created_at" attribute for the
     * attribute object that is to be sent to Customer.io
     * @return { number } [ The UNIX timestamp ]
     */
    Form.prototype.setTimestamp = function() {
      if( settings.created_at === false ) {
        return false;
      }

      // Generate a new timestamp
      var timestamp = Math.round(new Date().getTime() / 1000);
      // Set the timestamp on the attributes object
      this.set( "created_at" , timestamp );
      // Return the timestamp
      return timestamp;
    };

    /**
     * unset
     * This method removes a key from the attributes object that is to be
     * sent to Customer.io
     * @param  { value } key  [ the name of the key to be removed]
     * @return { object }     [ the attributes object ]
     */
    Form.prototype.unset = function( key ) {
      // Return false if the key argument is undefined
      if( key === undefined ) {
        return false;
      }
      // If the key exists in the attributs object
      if( key in this.attributes ) {
        // Remove the key from the object
        delete this.attributes[ key ];
      }
      // Return the attributes object
      return this.attributes;
    };

    /**
     * before
     * This method executes a before callback before the data is sent
     * to Customer.io
     * @return { object } [ the cioForm object ]
     */
    Form.prototype.before = function() {
      // Execute the callback function
      _callback( settings.before, this );
      // Returning the model
      return this;
    };

    /**
     * completed
     * This method executes a callback if the form has already been completed
     *
     * @return { object } [ the cioForm object ]
     */
    Form.prototype.completed = function() {
      // Execute the callback function
      _callback( settings.completed, this );
      // Returning the model
      return this;
    };

    /**
     * error
     * This method executes a error callback after the data as been sent
     * to Customer.io
     * @return { object } [ the cioForm object ]
     */
    Form.prototype.error = function() {
      // Execute the callback function
      _callback( settings.error, this );
      // Returning the model
      return this;
    };

    /**
     * onLoad
     * This method executes a callback right when $.cioForm initializes
     *
     * @return { object } [ the cioForm object ]
     */
    Form.prototype.onLoad = function() {
      // Execute the callback function
      _callback( settings.onLoad, this );
      // Returning the model
      return this;
    };

    /**
     * reset
     * This resets all the fields on the form
     * @return { object } [ the cioForm object ]
     */
    Form.prototype.reset = function() {
      // Find and loop through all the inputs
      this.$el.find( "input" ).each( function() {
        // Set the values to blank
        this.value = "";
      });
      // Returning the model
      return this;
    };

    /**
     * send
     * This method sends data (in the form of an object) to Customer.io
     *
     * @param   { object } [ a object with data to send to cio ]
     * @return  { object } [ the cioForm object ]
     */
    Form.prototype.send = function( attributes ) {
      var that = this;

      // Return an error if CIO is not defined in global
      if( !window._cio || !window._cio.identify ) {
        throw "You don't have have Customer.io setup properly.";
        return that.error();
      }

      // Use attributes argument if defined. If not, fallback
      // to attributes generated from the form via input name/values
      var data = attributes ? attributes : that.attributes;
      // Return an error if the data is not an object
      if( data === undefined || typeof data !== "object" ) {
        throw "The data you're sending to Customer.io isn't setup properly.";
        return that.error();
      }

      // Send the attributes to Customer.io
      _cio.identify( data );

      // Update the success state in _settings to true
      _settings.success = true;
       // Returning the model
      return this;
    };

    /**
     * success
     * This method executes a success callback if the data is sent
     * to Customer.io successfully
     * @return { object } [ the cioForm object ]
     */
    Form.prototype.success = function() {
      var that = this;
      // Return false if success state is false
      if( !_settings.success ) {
        return false;
      }
      // Defining the success callback from settings
      var successFn = settings.success;
      // If the success callback is valid
      if( successFn && typeof successFn === "function" ) {
        // Execute the callback with .call(this) and passing the
        // attributes object as an argument
        successFn.call( that, that.attributes );
      }
      // Returning the model
      return this;
    };

    /**
     * submit
     * This method executes to submit the form
     * @return { object } [ the cioForm object ]
     */
    Form.prototype.submit = function() {
      var that = this;
      // Getting the attributes from the form
      that.getAttributes();
      // Executing the before callback
      that.before();
      // Sending the data to CIO
      that.send();

      // Submit the form when identified promise is resolved
      _identified( function() {

        // Execute methods if data is valid
        if( _settings.success ) {
          // Setting the cookie the Cookie
          that.setCookie();
          // Execute the success method
          that.success();
          // Set the form's action
          that.setAction();
          // Submit the form if settins.remote is false
          if( settings.remote === false ) {
            that.forceSubmit();
          }
        }
      } );

      // Returning the model
      return this;
    };

    Form.prototype.forceSubmit = function() {
      this.el.submit();
    };

    /**
     * initialize
     * This method initializes the Form class
     * @return { object } [ the cioForm object ]
     */
    Form.prototype.initialize = function() {
      var that = this;
      // Defining $el
      var $el = that.$el;

      // Execute the onLoad callback
      that.onLoad();

      // Setting the form's action
      that.getAction();

      // Defining the submit event
      $el.submit( function( event ) {
        // Prevent the form from sending
        event.preventDefault();
        // Execute cioForm's submit method
        that.submit();
      });


      // Defining completed callback
      var completed = settings.completed;
      // If completed is defined and is a callback
      // and the form has been filled (defined by cookie)
      if( completed && typeof completed === "function" &&
          that.hasFilled() ) {
          // Execute the completed callback
          that.completed();
      }

      // Returning the model
      return this;
    };



    // Returning the plugin jQuery object to allow for jQuery chaining
    return this.each( function() {
      // Defining $this
      var $this = $(this);
      // Defining cioForm
      var cioForm;

      // If this jQuery object has already rendered Form, return
      if( $this.data( _settings.dataName ) ) return;

      // Creating the Form class and assigning it to the cioForm variable
      cioForm = new Form( this );

      // Adding the Form class to the data of the object
      $this.data( _settings.dataName, cioForm );
    });

  };

})(jQuery);