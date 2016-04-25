// Copyright (c) 2016 fixanoid.
// Use of this source code is governed by a license that can be
// found in the LICENSE file.


let j, cart, expected,
 config = {
	clearCart: browser.localStorage['clearCart'] === 'true' ? true : false,
	primary: browser.localStorage['primary'] ? browser.localStorage['primary'] : 'amazon.com'
 },
 LINKS = {
	base: 'https://share-a-cart.firebaseio.com/'
 },
 firebase = new Firebase(LINKS.base);

Firebase.goOffline();

// set the links needed for operation on amazon sites
refreshLinks();


let workFrame = document.createElement('IFRAME');
workFrame.setAttribute('src', '');
workFrame.id = 'work-frame';
document.body.appendChild(workFrame);

// frames for loading items. Splitting at 1x35 items, for a total max of 350
for (j = 0; j < 10; j++) {
	let f = document.createElement('IFRAME');
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
			expected.count--;

			if (expected.count == 0) {
				browser.newTab(expected.dest);
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
			let id = request.id;

			Firebase.goOnline();

			firebase.child(id).on('value', function(snapshot) {
			  if (!snapshot.val()) {
					browser.sendMessage({
						'action': 'show-error',
						'error': 'No such cart...'
					});

					return;
				}

				let counter = 1,
				 pages = [],
				 params = [],
				 remote = snapshot.val(),
				 link = remote.dest ? 'https://www.' + remote.dest + '/gp/aws/cart/add.html?AssociateTag=repricin-20&tag=repricin-20&' : 'https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=repricin-20&tag=repricin-20&';

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

				for (let i = 0; i < pages.length; i++) {
					let pageLink = link + pages[i].join('&');

					let f = document.getElementById('load-' + i );
					f.src = pageLink;
				}

				expected = {
					count: pages.length,
					dest: remote.dest ? 'https://www.' + remote.dest + '/gp/cart/view.html' : 'https://www.amazon.com/gp/cart/view.html'
				}
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

			let id = UUID(),
			 ref = firebase.child(id);

			ref.set({
				'dest': config.primary,
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
					if (config.clearCart === true) {
						browser.sendMessage({
							'action': 'nuke-cart'
						});
					}
				}

			});
		}
	});


// refresh config if changed
$(window).bind('storage', function (e) {
	if (e.originalEvent.key === 'primary') {
		config.primary = browser.localStorage['primary'] ? browser.localStorage['primary'] : 'amazon.com';

		refreshLinks();
	} else if (e.originalEvent.key === 'clearCart') {
		config.clearCart = browser.localStorage['clearCart'] === 'true' ? true : false;
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


function refreshLinks() {
	LINKS = {
		base: 'https://share-a-cart.firebaseio.com/',
		cart: 'https://www.' + config.primary + '/gp/cart/view.html',
		awsCart: 'https://www.' + config.primary + '/gp/aws/cart/add.html?AssociateTag=repricin-20&tag=repricin-20&'
	}
}


function UUID() {
	return ('0000' + (Math.random() * Math.pow(36, 5) << 0).toString(36)).slice(-5).toUpperCase()
}

	/* May need a longer one?
	let UUID = (function() {
	  let self = {};
	  let lut = []; for (let i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
	  self.generate = function() {
	    let d0 = Math.random()*0xffffffff|0;
	    let d1 = Math.random()*0xffffffff|0;
	    let d2 = Math.random()*0xffffffff|0;
	    let d3 = Math.random()*0xffffffff|0;
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

for (let i = 0; i < c.length; i++) {
  (function(item) {
    setTimeout(function() {
      console.log(item);
      item.click() },
    i * 1000 )})(c[i]);
}
*/
