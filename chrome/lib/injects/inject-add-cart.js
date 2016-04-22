// Add page injection
var cart = {
  init: function() {
    // determining if were in a work frame
		try {
			if (window.top.location != window.location) {
				cart.ifr = true;
			} else {
				cart.ifr = false;
			}
		} catch (e) {
			cart.ifr = true;
		}

    if (!cart.ifr) {
      return;
    }


    var addButton = document.querySelector('body > div.bucket > div > div > form > span > input[type="image"');


    if (addButton) {
        addButton.click();
    } else {
      // reloaded after clicking add.

      browser.sendMessage({
        'action': 'cart-loaded'
      });
    }
  }
};


window.addEventListener( 'load', function() {
	cart.init();
}, false );
