// Cart injection
var cart = {
  init: function() {
		cart.readCart();
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


		if (contents.length == 0) {
			self.port.emit('show-error', {
				'error': 'Your cart is empty...'
			});

			return;
		}

		var firebase = new Firebase('https://share-a-cart.firebaseio.com/');
		Firebase.goOnline();

		var id = cart.UUID(),
			ref = firebase.child(id);

		ref.set({
			'cart': contents,
			'timestamp': (new Date()).getTime()
		},
		function(err) {
			Firebase.goOffline();

			if (err) {
				self.port.emit('show-error', {
					'error': err
				});
			} else {
				self.port.emit('my-cart-id', {
					'id': id
				});
			}
		});

  },

	UUID: function() {
		return ('0000' + (Math.random() * Math.pow(36,4) << 0).toString(36)).slice(-5).toUpperCase()
	}
};


cart.init();
