function init() {
	var cart;

	$('#working').hide();
	$('#send-cart').click(function() {
		$('#working').show();

		self.port.emit('send-cart');
	});

	$('#receive-cart').click(function() {
		$('#error-row').hide();
		$('#my-row').hide();

		$('#button-row').hide();
		$('#entry-row').show();
	});

	$('#get-cart').click(function() {
		var id = $('#cart-id').val();

		if (id) {
			self.port.emit('receive-cart', {
				'id': id
			});
		}
	});

	$('#back').click(function() {
		if (cart) {
			$('#my-row').show();
		}

		$('#entry-row').hide();
		$('#button-row').show();
	});


	self.port.on('my-cart-id', function(request) {
		cart = request.id;

		$('#error-row').hide();

		$('#my-cart-id').html(cart);
		$('#my-row').show();
		$('#working').hide();
	});

	self.port.on('show-error', function(request) {
		$('#error-row').html(request.error).show();
		$('#working').hide();
	});

	self.port.emit('get-initial');
}

$(document).ready(function() {
	init();
});
