// Copyright (c) 2016 fixanoid.
// Use of this source code is governed by a license that can be
// found in the LICENSE file.

// Firefox browser API shim
var buttons = require('sdk/ui/button/action'),
 { ToggleButton } = require('sdk/ui/button/toggle');
 panels = require('sdk/panel');
 tabs = require('sdk/tabs'),
 self = require('sdk/self'),
 pageWorker = require('sdk/page-worker');


const LINKS = {
  cart: 'https://www.amazon.com/gp/cart/view.html'
}

var cart;


var panel = panels.Panel({
  width: 210,
  contentURL: self.data.url('popup.html'),
  contentScriptFile: [ self.data.url('js/jquery-2.1.3.min.js'), self.data.url('js/popup.js') ],
  onHide: function() {
    button.state('window', { checked: false });
  }
}),

workFrame = null,

button = ToggleButton({
  id: 'amazon-share-a-cart-button',
  label: 'Amazon Share-A-Cart',
  icon: {
    '16': self.data.url('images/amazon-cart-16.png'),
    '32': self.data.url('images/icon-32.png'),
    '64': self.data.url('images/icon-64.png')
  },

  onChange: function(state) {
    if (state.checked) {
      panel.show({
        position: button
      });
    }
  }
});




/* Panel */
panel.port.on('send-cart', function() {
  console.log('send-cart requested');

  if (workFrame) {
    workFrame.destroy();
  }

  workFrame = pageWorker.Page({
    contentScriptFile: [ self.data.url('js/firebase-min-2.4.0.js'), self.data.url('js/cart-worker.js') ],
    contentURL: 'https://www.amazon.com/gp/cart/view.html'
  });

  workFrame.port.on('show-error', function(request) {
    console.log('show-error', request);

    panel.port.emit('show-error', {
       error: request.error
    });
  });

  workFrame.port.on('my-cart-id', function(request) {
    cart = request.id;

    console.log('my-cart-id', request);

    panel.port.emit('my-cart-id', {
		   'id': cart
	  });
  });
});


panel.port.on('get-initial', function() {
  console.log('get-initial requested');

  if (cart) {
	  panel.port.emit('my-cart-id', {
		   'id': cart
	  });
  }
});


panel.port.on('receive-cart', function(request) {
  var id = request.id;

  if (workFrame) {
    workFrame.destroy();
  }

  workFrame = pageWorker.Page({
    contentScriptFile: [ self.data.url('js/firebase-min-2.4.0.js'), self.data.url('js/fire-worker.js') ],
    contentURL: self.data.url('fire-worker.html')
  });

  workFrame.port.emit('receive-cart', {
    id: id
  });

  workFrame.port.on('show-error', function(request) {
    console.log('show-error', request);

    panel.port.emit('show-error', {
       error: request.error
    });
  });

  workFrame.port.on('add-cart-link', function(request) {
    console.log('add-cart-link', request);

    var addFrame = pageWorker.Page({
      contentScriptFile: [ self.data.url('js/cart-add-worker.js') ],
      contentURL: self.data.url(request.link)
    });

    addFrame.port.on('cart-loaded', function() {
      console.log('contents-added');

      var { setTimeout } = require("sdk/timers");

      setTimeout(function() {
        tabs.open(LINKS.cart);

        addFrame.destroy();
      }, 1000);
    });
  });
});



exports.main = function (options, callbacks) {
	if (options && options.loadReason === 'install') {
		tabs.open(self.data.url('halp.html'));
	}
};
