// Copyright (c) 2016 fixanoid.
// Use of this source code is governed by a license that can be
// found in the LICENSE file.


const LINKS = {
	cart: 'https://www.amazon.com/gp/cart/view.html'
}

var j, cart, expected;

var firebase = new Firebase('https://share-a-cart.firebaseio.com/');
Firebase.goOffline();

var workFrame = document.createElement('IFRAME');
workFrame.setAttribute('src', '');
workFrame.id = 'work-frame';
document.body.appendChild(workFrame);

// frames for loading items. Splitting at 1x35 items, for a total max of 350
for (j = 0; j < 10; j++) {
	var f = document.createElement('IFRAME');
	f.setAttribute('src', '');
	f.id = 'load-' + j;
	document.body.appendChild(f);
}


browser.initBadge({
	resetTabCount: function(details) {},
	updateBadge: function (tabId) {}
});


browser.onMessage(
	function(request, sender, sendResponse) {
		if (request.action == 'send-cart') {
			workFrame.src = LINKS.cart;
		} else if (request.action == 'cart-loaded') {
			expected--;

			if (expected == 0) {
				browser.newTab(LINKS.cart);
			} else {
				// we wait!
			}
		} else if (request.action == 'get-initial') {
			if (cart) {
				browser.sendMessage({
					'action': 'my-cart-id',
					'id': cart
				});
			}
		} else if (request.action == 'receive-cart') {
			var id = request.id;

			Firebase.goOnline();

			firebase.child(id).on("value", function(snapshot) {
			  if (!snapshot.val()) {
					browser.sendMessage({
						'action': 'show-error',
						'error': 'No such cart...'
					});

					return;
				}

				var counter = 1,
				 pages = [],
				 params = [],
				 link = 'https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=repricin-20&tag=repricin-20&',
				 remote = snapshot.val();

				remote.cart.forEach(
					function(item) {
						params.push('ASIN.' + counter + '=' + item.asin);
						params.push('Quantity.' + counter + '=' + item.quantity);

						if (counter == 35) {
							pages.push( params.slice(0) );
							params = [];

							counter = 0;
						}

						counter++;
					});

				Firebase.goOffline();

				// add any remainder items
				pages.push( params.slice(0) );


				// cut number of pages if more than 350 items.
				pages = pages.slice(0, 9);

				for (var i = 0; i < pages.length; i++) {
					var pageLink = link + pages[i].join('&');

					var f = document.getElementById('load-' + i );
					f.src = pageLink;
				}

				expected = pages.length;
			});
		} else if (request.action == 'cart-contents') {
			if (request.contents.length == 0) {
				browser.sendMessage({
					'action': 'show-error',
					'error': 'Your cart is empty...'
				});

				return;
			}

			Firebase.goOnline();

			var id = UUID(),
			 ref = firebase.child(id);

			ref.set({
			  'cart': request.contents,
			  'timestamp': (new Date()).getTime()
			},
			function(err) {
				Firebase.goOffline();

				if (err) {
					browser.sendMessage({
						'action': 'show-error',
						'error': err
					});
				} else {
					browser.sendMessage({
						'action': 'my-cart-id',
						'id': id
					});

					cart = id;

					// Clear cart if needed
					var emptyCart = localStorage['clearCart'] === 'true' ? true : false;

					if (emptyCart === true) {
						browser.sendMessage({
							'action': 'nuke-cart'
						});
					}
				}

			});
		}
	});


browser.onInstall(
	function(details) {
		if (details.reason == 'install') {
			chrome.tabs.create({url: 'halp.html'});
		} else if (details.reason == 'update') {
			chrome.tabs.create({url: 'news.html'});
		}
	});


function UUID() {
	return ("0000" + (Math.random() * Math.pow(36, 5) << 0).toString(36)).slice(-5).toUpperCase()
}

	/* May need a longer one?
	var UUID = (function() {
	  var self = {};
	  var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
	  self.generate = function() {
	    var d0 = Math.random()*0xffffffff|0;
	    var d1 = Math.random()*0xffffffff|0;
	    var d2 = Math.random()*0xffffffff|0;
	    var d3 = Math.random()*0xffffffff|0;
	    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
	      lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
	      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
	      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
	  }
	  return self;
	})();
	*/



/*
Clear amazon shopping cart:

c = document.querySelectorAll('#activeCartViewForm div.sc-list-body > div input[value=Delete]')

for (var i = 0; i < c.length; i++) {
  (function(item) {
    setTimeout(function() {
      console.log(item);
      item.click() },
    i * 1000 )})(c[i]);
}
*/
