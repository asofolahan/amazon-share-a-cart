function init() {
	$('#working').hide();
	$('#send-cart').click(function() {
		$('#working').show();

		browser.sendMessage({
			'action': 'send-cart'
		});
	});

	$('#receive-cart').click(function() {
		$('#button-row').hide();
		$('#entry-row').show();
	});

	$('#get-cart').click(function() {
		var id = $('#cart-id').val();

		if (id) {
			browser.sendMessage({
				'action': 'receive-cart',
				'id': id
			});
		}
	});

	$('#back').click(function() {
		$('#entry-row').hide();
		$('#button-row').show();
	});


	browser.onMessage(
		function(request, sender, sendResponse) {
			if (request.action == 'my-cart-id') {
				var id = request.id;

				$('#my-cart-id').html(id);
				$('#my-row').show();
				$('#working').hide();
			} else if (request.action == 'show-error') {
				$('#error-row').html(request.error).show();
				$('#working').hide();
			}
		});

		browser.sendMessage({'action': 'get-initial'});
}

$(document).ready(function() {
	init();
});
