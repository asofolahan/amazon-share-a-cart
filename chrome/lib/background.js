// Copyright (c) 2016 fixanoid.
// Use of this source code is governed by a license that can be
// found in the LICENSE file.


/*
1. Read cart contents
2. Share cart contents
3. Empty cart? and add new contents
*/

const LINKS = {
	cart: 'https://www.amazon.com/gp/cart/view.html'
}

var cart;

var firebase = new Firebase('https://share-a-cart.firebaseio.com/');
Firebase.goOffline();

var workFrame = document.createElement("IFRAME");
workFrame.setAttribute("src", "");
workFrame.id = 'work-frame';
document.body.appendChild(workFrame);


browser.initBadge({
	resetTabCount: function(details) {},
	updateBadge: function (tabId) {}
});


browser.onMessage(
	function(request, sender, sendResponse) {
		if (request.action == 'send-cart') {
			workFrame.src = LINKS.cart;
		} else if (request.action == 'cart-loaded') {
			browser.newTab(LINKS.cart);
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
				 params = [],
				 link = 'https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=repricin-20&tag=repricin-20&',
				 remote = snapshot.val();

				remote.cart.forEach(
					function(item) {
						params.push('ASIN.' + counter + '=' + item.asin);
						params.push('Quantity.' + counter + '=' + item.quantity);

						counter++;
					});

				link = link + params.join('&');

				workFrame.src = link;

				Firebase.goOffline();
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
				}

			});
		}
	});


browser.onInstall(
	function(details) {
		if (details.reason == "install") {
				chrome.tabs.create({url: "halp.html"});
		} else if (details.reason == "update") {
			// Show updates?
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
