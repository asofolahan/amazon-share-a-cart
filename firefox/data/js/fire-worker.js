// Add Cart injection
var cart = {
  init: function() {
    self.port.on('receive-cart', function(request) {
      cart.retrieveContents(request.id);
    });
  },

  retrieveContents: function(id) {
    var firebase = new Firebase('https://share-a-cart.firebaseio.com/');
		Firebase.goOnline();

    firebase.child(id).on('value', function(snapshot) {
    	if (!snapshot.val()) {
    		self.port.emit('show-error', {
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
      Firebase.goOffline();

      self.port.emit('add-cart-link', {
        'link': link
      });
    });
  }
};


cart.init();
