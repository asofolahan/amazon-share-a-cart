// Cart injection
var cart = {
  init: function() {
    // browser.onMessage(
  	// 	function(request, sender, sendResponse) {
  	// 		if (request.action == 'read-cart') {
    //       cart.readCart();
  	// 		}
  	// 	});

      if (window.top != window) {
        browser.sendMessage({
          'action': 'cart-contents',
          'contents': cart.readCart()
        });
      }
  },

  readCart: function() {
    var contents = [], c = document.querySelectorAll('#activeCartViewForm div.sc-list-body > div');

    for (var i = 0; i < c.length; i++) {
      var row = c[i];

      contents.push({
        asin: row.dataset.asin,
        quantity: row.dataset.quantity
      });
    }

    return contents;
  }
};


window.addEventListener( "load", function() {
	cart.init();
}, false );
