$(document).ready(function() {
  var config = {
  	clearCart: localStorage['clearCart'] === 'true' ? true : false,
    primary: localStorage['primary'] ? localStorage['primary'] : 'amazon.com'
  }

  // clear cart option
  if (config.clearCart === true) {
    $('#do-clear').prop('checked', 'checked');
  }

  $('#do-clear').click(function(e) {
    localStorage['clearCart'] = $('#do-clear').prop('checked');
  });

  // primary store option
  $('#primary-store').val( config.primary );
  $('#primary-store').change(function(e) {
    localStorage['primary'] = $('#primary-store').val();
  });




  $('#halp-tab').click(function(e) {
    e.preventDefault();

    if ($('#halp-tab').hasClass('active')) {
      return;
    }

    $('#halp-tab').toggleClass('active');
    $('#halp-content').show();

    $('#options-tab').toggleClass('active');
    $('#options-content').hide();
  });


  $('#options-tab').click(function(e) {
    e.preventDefault();

    if ($('#options-tab').hasClass('active')) {
      return;
    }

    $('#halp-tab').toggleClass('active');
    $('#halp-content').hide();

    $('#options-tab').toggleClass('active');
    $('#options-content').show();
  });

});
