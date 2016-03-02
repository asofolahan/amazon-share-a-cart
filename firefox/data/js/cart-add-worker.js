// Add Cart injection
var cart = {
  init: function() {
    // all we need to do here, is press continue.
    document.querySelector('body > div.bucket > div > div > form > span > input[type="image"').click();

    self.port.emit('cart-loaded', {});
  }
};


cart.init();
