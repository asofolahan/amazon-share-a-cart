// Add page injection
var cart = {
  init: function() {
    // all we need to do here, is press continue.
    document.querySelector('body > div.bucket > div > div > form > span > input[type="image"').click();

    browser.sendMessage({
      'action': 'cart-loaded'
    });
  }
};


window.addEventListener( "load", function() {
	cart.init();
}, false );
