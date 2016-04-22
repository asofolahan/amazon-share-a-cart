// Cart injection
var cart = {
  init: function() {
    if (window.top != window) {
      browser.sendMessage({
        'action': 'cart-contents',
        'contents': cart.readCart()
      });
    }


    browser.onMessage(
  		function(request, sender, sendResponse) {
  			if (request.action == 'nuke-cart') {
          cart.emptyCart();
  			}
  		});
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
  },

  emptyCart: function() {
    var c = document.querySelectorAll('#activeCartViewForm div.sc-list-body > div input[value=Delete]');

    // Press "Delete" next to each item at a rate of 1 per second
    for (var i = 0; i < c.length; i++) {
      (function(item) { setTimeout(function() { item.click() }, i * 1000 )})(c[i]);
    }
  }
};


window.addEventListener( 'load', function() {
	cart.init();
}, false );
